import express from "express";
import verifyToken from "../middleware/global/tokenverify.middleware.js";
import getExam from "../middleware/exam/getexam.middleware.js";
import { getPublicExamInfo } from "../controllers/publicexam.controller.js";

const router = express.Router();

// Route: POST /api/public-exam/getinfo
router.post("/getinfo", verifyToken, getExam, getPublicExamInfo);

export default router;
