import db from "../db.js";
import { constants } from "../../config/constants.js";

async function rejectIfAttemptExists(req, res, next) {
  const { exam_attempt_id } = req.body;
  try {
    const userAttemptCheckQuery = "SELECT * FROM exam_attempt WHERE id=?";
    const [userAttemptCheckResult] = await db.query(userAttemptCheckQuery, [
      exam_attempt_id,
    ]);

    if (userAttemptCheckResult.length != 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "Your attempt already exists" });
    }
    next();
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Database Erorr" });
  }
}

export default rejectIfAttemptExists;
