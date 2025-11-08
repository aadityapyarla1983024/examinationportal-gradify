import express from "express";
import verifyToken from "../middleware/global/tokenverify.middleware.js";
import { getUserExams } from "../controllers/myexams.controller.js";

const router = express.Router();

// Route: POST /api/myexams/short/get-exams
router.post("/short/get-exams", verifyToken, getUserExams);

export default router;
