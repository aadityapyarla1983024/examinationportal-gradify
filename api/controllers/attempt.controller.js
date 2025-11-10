import db from "../db.js";
import { constants } from "../../config/constants.js";

// Function to update exam statistics
const updateExamStatistics = async (connection, examId) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_attempts,
        MAX(awarded_marks) as highest_marks,
        MIN(awarded_marks) as lowest_marks,
        AVG(awarded_marks) as average_marks
      FROM exam_attempt 
      WHERE exam_id = ? 
      AND submitted_at IS NOT NULL
      AND awarded_marks IS NOT NULL
    `;

    const [stats] = await connection.query(statsQuery, [examId]);

    const upsertQuery = `
      INSERT INTO exam_statistics 
        (exam_id, total_attempts, highest_marks, lowest_marks, average_marks) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        total_attempts = VALUES(total_attempts),
        highest_marks = VALUES(highest_marks),
        lowest_marks = VALUES(lowest_marks),
        average_marks = VALUES(average_marks)
    `;

    await connection.query(upsertQuery, [
      examId,
      stats[0].total_attempts || 0,
      stats[0].highest_marks || 0,
      stats[0].lowest_marks || 0,
      stats[0].average_marks || 0,
    ]);
  } catch (error) {
    console.error("Error updating exam statistics:", error);
    throw error;
  }
};

// Helper function to ensure 2 decimal places
const toDecimal = (value) => {
  if (value === null || value === undefined) return null;
  return parseFloat(Number(value).toFixed(2));
};

// Function to calculate marks for MCQ questions with partial marking support
const calculateMCQMarks = (question, answeredOptions, examPartialMarking) => {
  const totalCorrectOptions = question.correctOptions.length;
  const totalSelectedOptions = answeredOptions.length;

  if (totalCorrectOptions === 0) return 0;

  let correctSelected = 0;
  let incorrectSelected = 0;

  // Count correct and incorrect selections
  for (const optionId of answeredOptions) {
    if (question.correctOptions.includes(optionId)) {
      correctSelected++;
    } else {
      incorrectSelected++;
    }
  }

  // If partial marking is disabled, use all-or-nothing
  if (!examPartialMarking) {
    const isFullyCorrect =
      correctSelected === totalCorrectOptions && incorrectSelected === 0;
    return isFullyCorrect ? toDecimal(question.marks) : 0;
  }

  // Partial marking logic
  const marksPerCorrectOption = toDecimal(question.marks / totalCorrectOptions);
  const deductionPerIncorrect = toDecimal(question.marks / totalCorrectOptions);

  let calculatedMarks = toDecimal(correctSelected * marksPerCorrectOption);
  calculatedMarks = toDecimal(
    calculatedMarks - incorrectSelected * deductionPerIncorrect
  );

  // Ensure marks don't go below 0
  return Math.max(0, calculatedMarks);
};

// ---------------- START ATTEMPT ----------------
export const startAttempt = async (req, res) => {
  const { user_id, exam } = req;
  if (exam.visibility === "private") {
    if (exam.user_id !== user_id) {
      console.log("Unauthorized attempt on private exam by user:", user_id);
      return res.status(constants.HTTP_STATUS.FORBIDDEN).send({
        message: "This exam is private. Only the creator can attempt it.",
      });
    }
  }
  try {
    console.log("Starting attempt for exam:", exam.id);
    console.log("Exam scheduled date:", exam.scheduled_date);
    console.log("Exam duration:", exam.duration_min);

    const currentTime = new Date();

    // Check if exam has scheduling restrictions
    if (exam.scheduled_date) {
      const scheduledDate = new Date(exam.scheduled_date);

      console.log("Current time:", currentTime);
      console.log("Scheduled date:", scheduledDate);

      // Calculate important time points
      const startWindowStart = new Date(scheduledDate.getTime() - 30 * 60000); // 30 min before scheduled
      const startWindowEnd = new Date(
        scheduledDate.getTime() + (exam.duration_min || 0) * 60000
      ); // scheduled + duration
      const submissionWindowEnd = new Date(
        scheduledDate.getTime() + (exam.duration_min + 30) * 60000
      ); // scheduled + duration + 30min

      console.log("Start window (30min before):", startWindowStart);
      console.log("Start window end (scheduled + duration):", startWindowEnd);
      console.log(
        "Submission window end (scheduled + duration + 30min):",
        submissionWindowEnd
      );

      // Check if current time is within start window (30min before scheduled to scheduled + duration)
      if (currentTime < startWindowStart) {
        console.log(
          "Too early - exam starts in",
          Math.ceil((startWindowStart - currentTime) / 60000),
          "minutes"
        );
        return res.status(constants.HTTP_STATUS.FORBIDDEN).send({
          message: `Exam starts in ${Math.ceil(
            (startWindowStart - currentTime) / 60000
          )} minutes. You can start 30 minutes before the scheduled time.`,
        });
      }

      // Check if current time is past the start window (scheduled + duration)
      if (currentTime > startWindowEnd) {
        console.log("Start window has expired");
        return res.status(constants.HTTP_STATUS.FORBIDDEN).send({
          message: "Exam start window has expired. Cannot start new attempt.",
        });
      }

      console.log("Within start window - allowing attempt start");
    }

    // Check if user has reached attempt limit
    if (exam.no_of_attempts !== -1) {
      // -1 means unlimited attempts
      const attemptCountQuery = `
        SELECT COUNT(*) as attempt_count 
        FROM exam_attempt 
        WHERE user_id = ? AND exam_id = ? AND submitted_at IS NOT NULL
      `;
      const [attempts] = await db.query(attemptCountQuery, [user_id, exam.id]);
      const attemptCount = attempts[0].attempt_count;

      console.log(
        "User attempt count:",
        attemptCount,
        "Max allowed:",
        exam.no_of_attempts
      );

      if (attemptCount >= exam.no_of_attempts) {
        return res.status(constants.HTTP_STATUS.FORBIDDEN).send({
          message: `You have reached the maximum number of attempts (${exam.no_of_attempts}) for this exam.`,
        });
      }
    }

    // Check for existing active attempt
    const activeAttemptQuery = `
      SELECT id, started_at FROM exam_attempt 
      WHERE user_id = ? AND exam_id = ? AND submitted_at IS NULL
    `;
    const [activeAttempts] = await db.query(activeAttemptQuery, [
      user_id,
      exam.id,
    ]);

    if (activeAttempts.length > 0) {
      const activeAttempt = activeAttempts[0];
      const startedAt = new Date(activeAttempt.started_at);
      const scheduledDate = new Date(exam.scheduled_date);
      const submissionDeadline = new Date(
        scheduledDate.getTime() + (exam.duration_min + 30) * 60000
      );

      // Check if submission window has expired for existing attempt
      if (currentTime > submissionDeadline) {
        console.log(
          "Submission window expired for existing attempt, creating new one"
        );
        // Mark the old attempt as expired by setting submitted_at
        await db.query(
          "UPDATE exam_attempt SET submitted_at = ? WHERE id = ?",
          [currentTime, activeAttempt.id]
        );
      } else {
        console.log("Resuming existing attempt:", activeAttempt.id);
        return res.send({
          message: "Resuming existing exam attempt",
          exam_attempt_id: activeAttempt.id,
          started_at: startedAt.toISOString(),
          is_resumed: true,
        });
      }
    }

    // Create new attempt
    const startExamQuery =
      "INSERT INTO exam_attempt (user_id, exam_id, started_at) VALUES (?, ?, NOW())";
    const [newExam] = await db.query(startExamQuery, [user_id, exam.id]);
    const [insertedExam] = await db.query(
      "SELECT started_at FROM exam_attempt WHERE id=?",
      [newExam.insertId]
    );
    const started_at_iso = new Date(insertedExam[0].started_at).toISOString();

    console.log("New attempt created:", newExam.insertId);

    return res.send({
      message: "Exam started successfully",
      exam_attempt_id: newExam.insertId,
      started_at: started_at_iso,
      is_resumed: false,
    });
  } catch (error) {
    console.error("Error starting attempt:", error);
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Could not start the exam" });
  }
};
// ---------------- SUBMIT EXAM ----------------
export const submitExam = async (req, res) => {
  const { answers, exam_attempt_id } = req.body;
  const { exam } = req;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check submission window for scheduled exams
    if (exam.scheduled_date) {
      const currentTime = new Date();
      const scheduledDate = new Date(exam.scheduled_date);
      const submissionDeadline = new Date(
        scheduledDate.getTime() + (exam.duration_min + 30) * 60000
      );

      console.log("Current time:", currentTime);
      console.log("Submission deadline:", submissionDeadline);

      if (currentTime > submissionDeadline) {
        await connection.rollback();
        return res.status(constants.HTTP_STATUS.FORBIDDEN).send({
          message: "Submission window has expired. Cannot submit the exam.",
        });
      }
    }

    const submitAttemptQuery =
      "UPDATE exam_attempt SET submitted_at=NOW() WHERE id=?";
    await connection.query(submitAttemptQuery, [exam_attempt_id]);
    let attempt_marks = 0;

    for (let answer of answers) {
      const question = exam.questions.find((q) => q.id === answer.question_id);
      if (!question)
        throw new Error(`Invalid question_id: ${answer.question_id}`);

      let awarded_marks = null;

      if (question.question_type !== "text") {
        // Use partial marking calculation for MCQ questions
        awarded_marks = calculateMCQMarks(
          question,
          answer.answeredOptions || [],
          exam.partial_marking
        );

        if (awarded_marks > 0) {
          attempt_marks = toDecimal(attempt_marks + awarded_marks);
        }
      } else {
        if (exam.evaluation === "auto") {
          awarded_marks = null; // placeholder for AI grading
        } else {
          awarded_marks = null; // manual evaluation needed
        }
      }

      const answerInsert =
        "INSERT INTO answer (exam_attempt_id, awarded_marks, question_id) VALUES (?, ?, ?)";
      const [insertedAnswer] = await connection.query(answerInsert, [
        exam_attempt_id,
        awarded_marks,
        answer.question_id,
      ]);
      const answer_id = insertedAnswer.insertId;

      if (question.question_type !== "text") {
        const answeredOptions = answer.answeredOptions || [];
        for (const option_id of answeredOptions) {
          const mcqInsert =
            "INSERT INTO mcq_answer (option_id, answer_id) VALUES (?, ?)";
          await connection.query(mcqInsert, [option_id, answer_id]);
        }
      } else {
        const text = answer.textAnswer || "";
        const textInsert =
          "INSERT INTO text_answer (answer_id, answer_text) VALUES (?, ?)";
        await connection.query(textInsert, [answer_id, text]);
      }
    }

    if (exam.evaluation === "auto") {
      await connection.query(
        "UPDATE exam_attempt SET awarded_marks=? WHERE id=?",
        [toDecimal(attempt_marks), exam_attempt_id]
      );

      // Update exam statistics for auto-evaluated exams
      await updateExamStatistics(connection, exam.id);
    } else {
      await connection.query(
        "UPDATE exam_attempt SET awarded_marks=NULL WHERE id=?",
        [exam_attempt_id]
      );
    }

    await connection.commit();
    return res.send({
      message: "Exam submitted successfully",
      auto_evaluated_marks:
        exam.evaluation === "auto" ? toDecimal(attempt_marks) : null,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error submitting exam:", error);
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Could not submit your exam" });
  } finally {
    connection.release();
  }
};
// ---------------- VIEW ATTEMPT ----------------
export const viewAttempt = async (req, res) => {
  const { exam } = req;
  const { exam_attempt_id } = req.body;
  const connection = await db.getConnection();
  try {
    const [attempt] = await connection.query(
      "SELECT * FROM exam_attempt WHERE id=?",
      [exam_attempt_id]
    );
    const [answers] = await connection.query(
      "SELECT * FROM answer WHERE exam_attempt_id=?",
      [exam_attempt_id]
    );

    let total_correct = 0;
    let total_incorrect = 0;
    let total_partial = 0;

    for (const answer of answers) {
      const question = exam.questions.find((q) => q.id === answer.question_id);
      if (question.question_type === "text") {
        const [text] = await connection.query(
          "SELECT * FROM text_answer WHERE answer_id=?",
          [answer.id]
        );
        answer.text_answer = text[0].answer_text;
        answer.isCorrect = null;
        if (answer.awarded_marks != null) {
          answer.isCorrect = answer.awarded_marks === 0 ? false : true;
        }
      } else {
        const [mcqs] = await connection.query(
          "SELECT option_id FROM mcq_answer WHERE answer_id=?",
          [answer.id]
        );
        answer.answeredOptions = mcqs.map((m) => m.option_id);

        // Calculate correctness with partial marking
        if (answer.awarded_marks !== null) {
          if (answer.awarded_marks === question.marks) {
            answer.isCorrect = true;
            total_correct++;
          } else if (answer.awarded_marks > 0) {
            answer.isCorrect = "partial";
            total_partial++;
          } else {
            answer.isCorrect = false;
            total_incorrect++;
          }
        } else {
          answer.isCorrect = null;
        }
      }
    }

    attempt[0].total_correct = total_correct;
    attempt[0].total_incorrect = total_incorrect;
    attempt[0].total_partial = total_partial;

    return res.send({ exam, answers, attempt: attempt[0] });
  } catch (error) {
    console.error("Error viewing attempt:", error);
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
};

export { updateExamStatistics, toDecimal, calculateMCQMarks };
