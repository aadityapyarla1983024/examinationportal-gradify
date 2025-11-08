import express from "express";
import { constants } from "../../config/constants.js";
import db from "../db.js";
import verfiyToken from "../middleware/tokenverify.middleware.js";
import getExam from "../middleware/getexam.middleware.js";

const pub = express.Router();

pub.post("/getinfo", verfiyToken, getExam, async (req, res) => {
  const { exam } = req;
  const connection = await db.getConnection();
  try {
    const getAttempts =
      "SELECT user_id, id, awarded_marks, submitted_at FROM exam_attempt WHERE exam_id=? ORDER BY submitted_at ASC";
    const [attempts] = await connection.query(getAttempts, [exam.id]);
    const firstAttempts = [];
    for (const attempt of attempts) {
      if (
        !firstAttempts.find((a) => a.user_id === attempt.user_id) &&
        attempt.awarded_marks != null
      ) {
        firstAttempts.push({
          user_id: attempt.user_id,
          id: attempt.id,
          awarded_marks: attempt.awarded_marks,
          submitted_at: attempt.submitted_at,
        });
      }
    }
    // now we need to get correct and incorrect answers for each attempt
    let serial = 0;
    for (const attempt of firstAttempts) {
      attempt.serial = ++serial;
      const getAnswers = "SELECT * FROM answer WHERE exam_attempt_id=?";
      const [answers] = await connection.query(getAnswers, [attempt.id]);
      attempt.total_attempted = answers.length;
      attempt.correct = 0;
      attempt.incorrect = 0;
      const getUser = "SELECT * FROM user WHERE id=?";
      const [user] = await connection.query(getUser, [attempt.user_id]);
      attempt.name = user[0].first_name + " " + user[0].last_name;
      attempt.email = user[0].email;
      for (const answer of answers) {
        const [correct] = await connection.query(
          "SELECT COUNT(*) AS cnt FROM mcq_answer AS m JOIN opt ON m.option_id=opt.id WHERE answer_id=? AND opt.is_correct=TRUE",
          [answer.id]
        );
        const [incorrect] = await connection.query(
          "SELECT COUNT(*) AS cnt FROM mcq_answer AS m JOIN opt ON m.option_id=opt.id WHERE answer_id=? AND opt.is_correct=FALSE",
          [answer.id]
        );
        attempt.correct += correct[0].cnt;
        attempt.incorrect += incorrect[0].cnt;
      }
    }
    const sortedAttempts = firstAttempts.sort((a, b) => {
      if (a.awarded_marks === b.awarded_marks) {
        return a.user_id - b.user_id;
      }
      return b.awarded_marks - a.awarded_marks;
    });
    return res.send({ exam, attempts: sortedAttempts.slice(0, 10) });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
});

export default pub;
