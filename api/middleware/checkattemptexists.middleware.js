import { constants } from "../../config/constants.js";
import db from "../db.js";

async function checkAttemptExists(req, res, next) {
  const { user_id, exam } = req;
  try {
    const getAttemptsQuery =
      "SELECT * FROM exam_attempt WHERE user_id=? AND exam_id=?";

    const [attempts] = await db.query(getAttemptsQuery, [user_id, exam.id]);

    if (exam.no_of_attempts === -1) {
      return next();
    }
    if (attempts.length === 0) {
      return next();
    }
    for (const attempt of attempts) {
      if (attempt.submitted_at === null) {
        return res.send({
          exam_attempt_id: attempts[0].id,
          started_at: attempts[0].started_at,
        });
      }
    }

    if (attempts.length < exam.no_of_attempts) {
      return next();
    } else {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "You have submitted the exam and out of attempts" });
    }
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ message: "Database error" });
  }
}

export default checkAttemptExists;
