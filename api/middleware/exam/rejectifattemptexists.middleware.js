import db from "../../db.js";
import { constants } from "../../../config/constants.js";

/**
 * Middleware to reject a request if the provided exam_attempt_id already exists.
 * Prevents duplicate attempts being inserted into the database.
 */
export default async function rejectIfAttemptExists(req, res, next) {
  const { exam_attempt_id } = req.body;

  if (!exam_attempt_id) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Exam attempt ID is required" });
  }

  try {
    const [existingAttempt] = await db.query(
      "SELECT id FROM exam_attempt WHERE id=?",
      [exam_attempt_id]
    );

    if (existingAttempt.length > 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "Your attempt already exists" });
    }

    next();
  } catch (error) {
    console.error("Error in rejectIfAttemptExists middleware:", error);
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Database Error" });
  }
}
