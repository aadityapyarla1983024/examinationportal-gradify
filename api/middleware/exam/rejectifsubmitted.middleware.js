import db from "../../db.js";
import { constants } from "../../../config/constants.js";

/**
 * Middleware to prevent multiple exam submissions.
 * Allows continuation only if there is an unsubmitted attempt.
 */
export default async function rejectIfSubmitted(req, res, next) {
  const { user_id, exam } = req;

  try {
    const [attempts] = await db.query(
      "SELECT submitted_at FROM exam_attempt WHERE exam_id=? AND user_id=?",
      [exam.id, user_id]
    );

    // Allow if there's at least one unsubmitted attempt
    const hasUnsubmitted = attempts.some((a) => a.submitted_at === null);
    if (hasUnsubmitted) return next();

    // Otherwise reject
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "You have already submitted the exam" });
  } catch (error) {
    console.error("Error in rejectIfSubmitted middleware:", error);
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ message: "Database Error", error });
  }
}
