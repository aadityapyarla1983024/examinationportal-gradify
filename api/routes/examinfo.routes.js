import express from "express";
import verifyToken from "../middleware/global/tokenverify.middleware.js";
import getExam from "../middleware/exam/getexam.middleware.js";
import { getExamStats } from "../controllers/examinfo.controller.js";

const router = express.Router();

// Route: POST /api/examinfo/get-exam-stats
router.post("/get-exam-stats", verifyToken, getExam, getExamStats);

export default router;
