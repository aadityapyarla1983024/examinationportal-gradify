import { constants } from "../../config/constants.js";
import db from "../db.js";

async function checkAttemptExists(req, res, next) {
  const { user_id, exam } = req;
  try {
    const checkAttemptQuery =
      "SELECT * FROM exam_attempt WHERE user_id=? AND exam_id=?";

    const [checkAttemptResult] = await db.query(checkAttemptQuery, [
      user_id,
      exam.id,
    ]);
    if (checkAttemptResult.length == 0) {
      return next();
    } else {
      if (checkAttemptResult[0].submitted_at != null) {
        return res
          .status(constants.HTTP_STATUS.BAD_REQUEST)
          .send({ message: "Your exam has already been submittes" });
      }
      return res.send({
        exam_attempt_id: checkAttemptResult[0].id,
        started_at: checkAttemptResult[0].started_at,
      });
    }
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ message: "Database error" });
  }
}

export default checkAttemptExists;
