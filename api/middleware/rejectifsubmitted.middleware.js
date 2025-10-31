import db from "../db.js";
import { constants } from "../../config/constants.js";

async function rejectIfSubmitted(req, res, next) {
  const { user_id, exam } = req;
  try {
    const checkSubmitQuery =
      "SELECT * FROM exam_attempt WHERE exam_id=? AND user_id=?";
    const [checkSubmitResult] = await db.query(checkSubmitQuery, [
      exam.id,
      user_id,
    ]);
    if (checkSubmitResult[0].submitted_at != null) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "You have already submitted the exam" });
    }
    next();
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ message: "Database Error" });
  }
}

export default rejectIfSubmitted;
