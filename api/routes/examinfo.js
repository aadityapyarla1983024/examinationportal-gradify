import express from "express";
import { constants } from "../../config/constants.js";
import verfiyToken from "../middleware/tokenverify.middleware.js";
import db from "../db.js";
import getExam from "../middleware/getexam.middleware.js";

const examinfo = express.Router();

examinfo.post("/get-exam-stats", verfiyToken, getExam, async (req, res) => {
  const { exam } = req;
  const connection = await db.getConnection();
  try {
    const getStatsQuery =
      "SELECT COUNT(*) AS total_attempts, COUNT(DISTINCT user_id) AS total_users, AVG(awarded_marks) AS avg, MAX(awarded_marks) AS max, MIN(awarded_marks) AS min FROM exam_attempt WHERE exam_id=?";
    const [statsResult] = await connection.query(getStatsQuery, [exam.id]);
    const getTotalMarks =
      "SELECT SUM(marks) AS total_marks FROM question WHERE exam_id=?";
    const [total_marks] = await connection.query(getTotalMarks, [exam.id]);

    const getAttemptsQuery =
      "SELECT exam_attempt.id as attempt_id, user_id, awarded_marks, first_name, last_name, email FROM exam_attempt  JOIN user ON user.id=user_id WHERE exam_id=?";

    let [attempts] = await connection.query(getAttemptsQuery, [exam.id]);
    let serial = 0;
    for (let attempt of attempts) {
      attempt.serial = ++serial;
      if (
        (attempt.awarded_marks === null ||
          attempt.awarded_marks === undefined) &&
        exam.evaluation === "manual"
      ) {
        attempt.status = "Pending";
      } else {
        attempt.status = "Completed";
        attempt.score = (attempt.awarded_marks / exam.total_marks) * 100;
      }
      attempt.name = `${attempt.first_name} ${attempt.last_name}`;
      const getAnswersQuery = "SELECT id FROM answer WHERE exam_attempt_id=?";
      const [answers] = await connection.query(getAnswersQuery, [
        attempt.attempt_id,
      ]);
      attempt.total_attempted = answers.length;
      attempt.correct = 0;
      attempt.incorrect = 0;
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
    const { questions, ...examWithoutQuestions } = exam;
    const finalResponse = {
      stats: statsResult[0],
      total_marks: total_marks[0].total_marks,
      attempts,
      exam: examWithoutQuestions,
    };
    return res.send(finalResponse);
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
});

export default examinfo;
