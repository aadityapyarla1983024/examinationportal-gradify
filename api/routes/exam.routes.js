import express from "express";
import verifyToken from "../middleware/global/tokenverify.middleware.js";
import getExam from "../middleware/exam/getexam.middleware.js";
import {
  createNewExam,
  getTags,
  getDomains,
  getFields,
  getExamDetails,
  getPublicExams,
} from "../controllers/exam.controller.js";

const router = express.Router();

router.post("/new-exam", verifyToken, createNewExam);
router.get("/get-tags", verifyToken, getTags);
router.get("/get-domains", verifyToken, getDomains);
router.get("/get-fields", verifyToken, getFields);
router.post("/get-exam", verifyToken, getExam, getExamDetails);
router.get("/public-exams", verifyToken, getPublicExams);

export default router;
