import db from "../db.js";
import { constants } from "../../config/constants.js";

async function rejectIfSubmitted(req, res, next) {
  const { user_id, exam } = req;
  try {
    const getAttempts =
      "SELECT * FROM exam_attempt WHERE exam_id=? AND user_id=?";
    const [attempts] = await db.query(getAttempts, [
      exam.id,
      user_id,
    ]);

    for (const attempt of attempts) {
      if (attempt.submitted_at === null) {
        return next();
      }
    }
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "You have already submitted the exam" });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ message: "Database Error" });
  }
}

export default rejectIfSubmitted;
