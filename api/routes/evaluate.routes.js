import express from "express";
import verifyToken from "../middleware/global/tokenverify.middleware.js";
import getExam from "../middleware/exam/getexam.middleware.js";
import {
  getAnswersForEvaluation,
  submitEvaluation,
} from "../controllers/evaluate.controller.js";

const router = express.Router();

router.post("/get-answers", verifyToken, getExam, getAnswersForEvaluation);
router.post("/submit", verifyToken, getExam, submitEvaluation);

export default router;
