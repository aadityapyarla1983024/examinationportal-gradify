import express from "express";
import verifyToken from "../middleware/global/tokenverify.middleware.js";
import getExam from "../middleware/exam/getexam.middleware.js";
import rejectIfSubmitted from "../middleware/exam/rejectifsubmitted.middleware.js";
import checkAttemptExists from "../middleware/exam/checkattemptexists.middleware.js";
import {
  startAttempt,
  submitExam,
  viewAttempt,
} from "../controllers/attempt.controller.js";

const router = express.Router();

router.post(
  "/start-attempt",
  verifyToken,
  getExam,
  checkAttemptExists,
  startAttempt
);
router.post(
  "/submit-exam",
  verifyToken,
  getExam,
  rejectIfSubmitted,
  submitExam
);
router.post("/view-attempt", verifyToken, getExam, viewAttempt);

export default router;
