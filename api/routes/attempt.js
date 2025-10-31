import express from "express";
import { constants } from "../../config/constants.js";
import db from "../db.js";
import verifyToken from "../middleware/tokenverify.middleware.js";
import getExam from "../middleware/getexam.middleware.js";
import rejectIfSubmitted from "../middleware/rejectifsubmitted.middleware.js";
import checkAttemptExists from "../middleware/checkattemptexists.middleware.js";

const attempt = express.Router();

attempt.post(
  "/start-attempt",
  verifyToken,
  getExam,
  checkAttemptExists,
  async (req, res) => {
    const { user_id, exam } = req;
    try {
      const startExamQuery =
        "INSERT INTO exam_attempt (user_id, exam_id, started_at) VALUES (?, ?, NOW())";
      const [startExamResult] = await db.query(startExamQuery, [
        user_id,
        exam.id,
      ]);
      const [rows] = await db.query(
        "SELECT started_at FROM exam_attempt WHERE id=?",
        [startExamResult.insertId]
      );
      const started_at_iso = new Date(rows[0].started_at).toISOString();
      return res.send({
        message: "Exam started successfully",
        exam_attempt_id: startExamResult.insertId,
        started_at: started_at_iso,
      });
    } catch (error) {
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Could not start the exam" });
    }
  }
);

attempt.post(
  "/submit-exam",
  verifyToken,
  getExam,
  rejectIfSubmitted,
  async (req, res) => {
    const { answers, exam_attempt_id } = req.body;
    const { exam } = req;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const submitAttemptQuery =
        "UPDATE exam_attempt SET submitted_at=NOW() WHERE id=?";
      await connection.query(submitAttemptQuery, [exam_attempt_id]);
      for (const answer of answers) {
        const answerInsert =
          "INSERT INTO answer (exam_attempt_id, question_id) VALUES (?, ?)";
        const [answerResult] = await connection.query(answerInsert, [
          exam_attempt_id,
          answer.question_id,
        ]);
        const answer_id = answerResult.insertId;
        const question = exam.questions.find(
          (question) => question.id === answer.question_id
        );
        if (question.question_type != "text") {
          for (const option_id of answer.answeredOptions) {
            const mcqAnswerInsert =
              "INSERT INTO mcq_answer (option_id, answer_id) VALUES (?, ?)";
            const [mcqAnswerInsertResult] = await connection.query(
              mcqAnswerInsert,
              [option_id, answer_id]
            );
          }
        } else {
          const textAnswerInsert =
            "INSERT INTO text_answer (answer_id, answer_text) VALUES (?, ?)";
          const [textAnswerResult] = await connection.query(textAnswerInsert, [
            answer_id,
            answer.textAnswer,
          ]);
        }
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
  }
);

export default attempt;
