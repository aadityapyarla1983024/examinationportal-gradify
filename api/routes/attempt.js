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
      let attempt_marks = 0;
      for (let answer of answers) {
        const question = exam.questions.find(
          (question) => question.id === answer.question_id
        );
        if (!question) {
          throw new Error(`Invalid question_id: ${answer.question_id}`);
        }
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
        }
        // ✨ added: handle auto text answer placeholder
        else if (question.question_type === "text") {
          if (exam.evaluation === "auto") {
            // leave placeholder for AI evaluation later
            awarded_marks = null; // marks will be filled by AI later
          } else {
            awarded_marks = null; // manual evaluation as before
          }
        }
        // ✨ end change

        const answerInsert = `INSERT INTO answer (exam_attempt_id, awarded_marks, question_id) VALUES (?, ?, ?)`;
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
        }
        // ✨ added: store text answer for AI/manual evaluation
        else {
          const text = answer.textAnswer || "";
          const textInsert =
            "INSERT INTO text_answer (answer_id, answer_text) VALUES (?, ?)";
          await connection.query(textInsert, [answer_id, text]);
          // this is where you can later integrate AI evaluation logic
          // e.g., call an AI API or queue the text for evaluation
        }
        // ✨ end change

        console.log({
          question_id: question.id,
          correctOptions: question.correctOptions,
          answeredOptions: answer.answeredOptions,
          isCorrect: answer.correct,
          currentAttemptMarks: attempt_marks,
        });
      }

      // changed: only update total marks if exam.evaluation is auto
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
  }
);

attempt.post("/view-attempt", verifyToken, getExam, async (req, res) => {
  const { exam } = req;
  const { exam_attempt_id } = req.body;
  const connection = await db.getConnection();
  try {
    const getAttempt = "SELECT * FROM exam_attempt WHERE id=?";
    const [attempt] = await connection.query(getAttempt, [exam_attempt_id]);
    const getAnswers = "SELECT * FROM answer WHERE exam_attempt_id=?";
    const [answers] = await connection.query(getAnswers, [exam_attempt_id]);
    let total_correct = 0;
    let total_incorrect = 0;
    for (const answer of answers) {
      const question = exam.questions.find(
        (question) => question.id === answer.question_id
      );
      if (question.question_type === "text") {
        const getTextAnswer = "SELECT * FROM text_answer WHERE answer_id=?";
        const [text] = await connection.query(getTextAnswer, [answer.id]);
        answer.text_answer = text[0].answer_text;
        answer.isCorrect = null;
        if (answer.awarded_marks != null) {
          answer.isCorrect = answer.awarded_marks === 0 ? false : true;
        }
        console.log(answer);
      } else {
        const getMcqAnswer =
          "SELECT option_id FROM mcq_answer WHERE answer_id=?";
        const [mcqs] = await connection.query(getMcqAnswer, [answer.id]);
        answer.answeredOptions = mcqs.map((mcq) => mcq.option_id);
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
        if (answer.awarded_marks === null) {
          answer.isCorrect = null;
        }
      }
      if (answer.isCorrect) total_correct += 1;
      else if (answer.isCorrect === false) total_incorrect += 1;
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
});

export default attempt;
