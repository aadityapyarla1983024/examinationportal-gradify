import db from "../db.js";
import { constants } from "../../config/constants.js";

// ---------------- START ATTEMPT ----------------
export const startAttempt = async (req, res) => {
  const { user_id, exam } = req;
  try {
    const startExamQuery =
      "INSERT INTO exam_attempt (user_id, exam_id, started_at) VALUES (?, ?, NOW())";
    const [newExam] = await db.query(startExamQuery, [user_id, exam.id]);
    const [insertedExam] = await db.query(
      "SELECT started_at FROM exam_attempt WHERE id=?",
      [newExam.insertId]
    );
    const started_at_iso = new Date(insertedExam[0].started_at).toISOString();
    return res.send({
      message: "Exam started successfully",
      exam_attempt_id: newExam.insertId,
      started_at: started_at_iso,
    });
  } catch (error) {
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
    const submitAttemptQuery =
      "UPDATE exam_attempt SET submitted_at=NOW() WHERE id=?";
    await connection.query(submitAttemptQuery, [exam_attempt_id]);
    let attempt_marks = 0;

    for (let answer of answers) {
      const question = exam.questions.find((q) => q.id === answer.question_id);
      if (!question)
        throw new Error(`Invalid question_id: ${answer.question_id}`);

      answer.correct = true;
      let awarded_marks = null;

      if (question.question_type !== "text") {
        if (question.correctOptions.length != answer.answeredOptions.length) {
          answer.correct = false;
        }
        for (const optionId of question.correctOptions) {
          if (!answer.answeredOptions.includes(optionId)) {
            answer.correct = false;
            break;
          }
        }
        awarded_marks = answer.correct ? question.marks : 0;
        if (answer.correct) attempt_marks += question.marks;
      } else {
        if (exam.evaluation === "auto") {
          awarded_marks = null; // placeholder for AI grading
        } else {
          awarded_marks = null;
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

      if (question.question_type != "text") {
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
        [attempt_marks, exam_attempt_id]
      );
    } else {
      await connection.query(
        "UPDATE exam_attempt SET awarded_marks=NULL WHERE id=?",
        [exam_attempt_id]
      );
    }

    await connection.commit();
    return res.send({ message: "Exam submitted successfully" });
  } catch (error) {
    await connection.rollback();
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
        answer.isCorrect = true;
        if (mcqs.length != question.correctOptions.length) {
          answer.isCorrect = false;
        } else {
          for (const option_id of question.correctOptions) {
            if (!mcqs.map((m) => m.option_id).includes(option_id)) {
              answer.isCorrect = false;
            }
          }
        }
        if (answer.awarded_marks === null) answer.isCorrect = null;
      }

      if (answer.isCorrect) total_correct++;
      else if (answer.isCorrect === false) total_incorrect++;
    }

    attempt[0].total_correct = total_correct;
    attempt[0].total_incorrect = total_incorrect;
    return res.send({ exam, answers, attempt: attempt[0] });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
};
