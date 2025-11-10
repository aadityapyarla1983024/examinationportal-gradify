import db from "../db.js";
import { constants } from "../../config/constants.js";
import { updateExamStatistics, toDecimal } from "./attempt.controller.js";

export async function getAnswersForEvaluation(req, res) {
  const { exam } = req;
  const { exam_attempt_id } = req.body;
  const connection = await db.getConnection();
  try {
    const [attempt] = await connection.query(
      "SELECT * FROM exam_attempt WHERE id=?",
      [exam_attempt_id]
    );

    if (attempt.length === 0) {
      return res
        .status(constants.HTTP_STATUS.NOT_FOUND)
        .send({ message: "Attempt not found" });
    }

    if (exam.evaluation === "no") {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "This exam cannot be evaluated" });
    }

    if (attempt[0].awarded_marks === null && exam.evaluation !== "no") {
      const [answers] = await connection.query(
        `SELECT a.*, q.marks, q.question_type 
         FROM answer a 
         JOIN question q ON a.question_id = q.id 
         WHERE a.exam_attempt_id=? AND a.awarded_marks IS NULL`,
        [exam_attempt_id]
      );

      for (const answer of answers) {
        if (answer.question_type === "text") {
          const [text] = await connection.query(
            "SELECT * FROM text_answer WHERE answer_id=?",
            [answer.id]
          );
          answer.text_answer = text?.[0]?.answer_text || "";
        } else {
          const [mcqs] = await connection.query(
            "SELECT option_id FROM mcq_answer WHERE answer_id=?",
            [answer.id]
          );
          answer.answered_options = mcqs.map((m) => m.option_id);
        }

        // Add question details for reference
        const question = exam.questions.find(
          (q) => q.id === answer.question_id
        );
        if (question) {
          answer.question_details = {
            title: question.title,
            question_type: question.question_type,
            marks: question.marks,
            correct_options: question.correctOptions || [],
          };
        }
      }

      return res.send({
        answers,
        exam: {
          id: exam.id,
          title: exam.title,
          partial_marking: exam.partial_marking,
          evaluation: exam.evaluation,
        },
      });
    } else {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "The exam has already been evaluated" });
    }
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
}

export async function submitEvaluation(req, res) {
  const { exam } = req;
  const { answers, exam_attempt_id } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [attempt] = await connection.query(
      "SELECT * FROM exam_attempt WHERE id=?",
      [exam_attempt_id]
    );

    if (attempt[0].awarded_marks != null) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "This attempt is already evaluated" });
    }

    let attempt_marks = 0;

    // Update each answer with awarded marks
    for (const answer of answers) {
      const awarded_marks = toDecimal(answer.awarded_marks);

      await connection.query("UPDATE answer SET awarded_marks=? WHERE id=?", [
        awarded_marks,
        answer.id,
      ]);

      attempt_marks = toDecimal(attempt_marks + awarded_marks);
    }

    // Update the attempt with total marks
    await connection.query(
      "UPDATE exam_attempt SET awarded_marks=? WHERE id=?",
      [toDecimal(attempt_marks), exam_attempt_id]
    );

    // Update exam statistics after manual evaluation
    await updateExamStatistics(connection, exam.id);

    await connection.commit();
    return res.send({
      message: "Successfully submitted your evaluation",
      total_marks: toDecimal(attempt_marks),
    });
  } catch (error) {
    await connection.rollback();
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
}

// New function to get evaluation summary
export async function getEvaluationSummary(req, res) {
  const { exam_attempt_id } = req.body;
  const connection = await db.getConnection();

  try {
    const [attempt] = await connection.query(
      `SELECT ea.*, e.title as exam_title, e.partial_marking, e.total_marks 
       FROM exam_attempt ea 
       JOIN exam e ON ea.exam_id = e.id 
       WHERE ea.id=?`,
      [exam_attempt_id]
    );

    if (attempt.length === 0) {
      return res.status(404).send({ message: "Attempt not found" });
    }

    const [answers] = await connection.query(
      `SELECT a.*, q.title as question_title, q.marks as max_marks, q.question_type 
       FROM answer a 
       JOIN question q ON a.question_id = q.id 
       WHERE a.exam_attempt_id=?`,
      [exam_attempt_id]
    );

    const summary = {
      attempt: attempt[0],
      answers: answers.map((answer) => ({
        id: answer.id,
        question_title: answer.question_title,
        question_type: answer.question_type,
        awarded_marks: toDecimal(answer.awarded_marks),
        max_marks: toDecimal(answer.max_marks),
        percentage:
          answer.awarded_marks !== null
            ? toDecimal((answer.awarded_marks / answer.max_marks) * 100)
            : null,
      })),
      total_awarded: toDecimal(
        answers.reduce((sum, a) => sum + (a.awarded_marks || 0), 0)
      ),
      total_possible: toDecimal(
        answers.reduce((sum, a) => sum + a.max_marks, 0)
      ),
      overall_percentage: toDecimal(
        (answers.reduce((sum, a) => sum + (a.awarded_marks || 0), 0) /
          answers.reduce((sum, a) => sum + a.max_marks, 0)) *
          100
      ),
    };

    res.send(summary);
  } catch (error) {
    return res.status(500).send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
}
