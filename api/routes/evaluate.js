import db from "../db.js";
import { constants } from "../../config/constants.js";
import express from "express";
import verfiyToken from "../middleware/tokenverify.middleware.js";
import getExam from "../middleware/getexam.middleware.js";

const evaluate = express.Router();

evaluate.post("/get-answers", verfiyToken, getExam, async (req, res) => {
  const { exam, user_id } = req;
  const { exam_attempt_id } = req.body;
  const connection = await db.getConnection();
  try {
    const getAttempt = "SELECT * FROM exam_attempt WHERE id=?";
    const [attempt] = await connection.query(getAttempt, [exam_attempt_id]);
    if (attempt[0].evaluation === "no") {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "This exam cannot be evaluated " });
    }

    if (attempt[0].awarded_marks === null && attempt[0].evaluation != "no") {
      const getAnswers =
        "SELECT * FROM answer WHERE exam_attempt_id=? AND awarded_marks IS NULL";
      const [answers] = await connection.query(getAnswers, [exam_attempt_id]);
      // Now we need to fetch the text answer for each of this answer object
      for (const answer of answers) {
        const getText = "SELECT * FROM text_answer WHERE answer_id=?";
        const [text] = await connection.query(getText, [answer.id]);
        answer.text_answer = text[0].answer_text;
      }
      return res.send({ answers, exam });
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
});

evaluate.post("/submit", verfiyToken, getExam, async (req, res) => {
  const { exam, user_id } = req;
  const { answers, exam_attempt_id } = req.body;
  if (exam.evaluation === "no") {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "This exam can't be evaluated" });
  }

  const connection = await db.getConnection();
  try {
    const getAttempt = "SELECT * FROM exam_attempt WHERE id=?";
    const [attempt] = await connection.query(getAttempt, [exam_attempt_id]);
    if (attempt[0].awarded_marks != null) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "This attempt is already evaluated" });
    }

    // now we need to evaluate the whole attempt
    let attempt_marks = 0;
    // firstly we need to fetch all the answers
    const getAnswers = "SELECT * FROM answer WHERE exam_attempt_id=?";
    const [dbanswers] = await connection.query(getAnswers, [exam_attempt_id]);
    //Now for each answer we need to get the mcqnanswer and text answer
    for (const answer of dbanswers) {
      //two cases either text answer or mcq
      // first find the question corresponding to this answer
      let isCorrect = true;
      const question = exam.questions.find(
        (question) => question.id === answer.question_id
      );
      if (question.question_type != "text") {
        const getMcqs = "SELECT * FROM mcq_answer WHERE answer_id=?";
        const [mcq] = await connection.query(getMcqs, [answer.id]);
        // now we need to check if both the arrays are equal or not
        if (mcq.length != question.correctOptions.length) {
          isCorrect = false;
        } else {
          for (const optionId of question.correctOptions) {
            if (!mcq.includes(optionId)) {
              isCorrect = false;
            }
          }
        }
        if (isCorrect) attempt_marks += question.marks;
      } else {
        const evaluatedMarks = answers.find(
          (a) => a.id === answer.id
        ).awarded_marks;
        const updateMarks = "UPDATE answer SET awarded_marks=? WHERE id=?";
        const [result] = await connection.query(updateMarks, [
          evaluatedMarks,
          answer.id,
        ]);
        attempt_marks += evaluatedMarks;
      }
    }
    // Now we will update the attempt marks to mark the evaluation as complete
    const updateAttempt = "UPDATE exam_attempt SET awarded_marks=? WHERE id=?";
    const [result] = await connection.query(updateAttempt, [
      attempt_marks,
      exam_attempt_id,
    ]);
    return res.send({ message: "Successfully submitted your evaluation" });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
});

export default evaluate;
