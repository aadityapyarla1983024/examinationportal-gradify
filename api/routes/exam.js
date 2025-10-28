import express from "express";
import db from "../db.js";
import verfiyToken from "../middleware/tokenverify.middleware.js";
import { constants } from "../../config/constants.js";
import generateExamCode from "../utilities/examcodegenerator.js";
import * as z from "zod";
const app = express();
const exam = app.use(express.Router());

const QUESTION_TYPES = {
  "single-choice": 1,
  "multi-choice": 2,
  text: 3,
};

const Exam = z.object({
  duration_min: z.int().optional(),
  exam_title: z.string({
    required_error: "Exam title is required",
    invalid_type_error: "Exam title cannot be null",
  }),
  scheduled_date: z.iso.datetime().optional(),
});

exam.post("/new-exam", verfiyToken, async (req, res) => {
  const { exam_title, duration_min, scheduled_date, questions, grading } = req.body;

  const result = Exam.safeParse({ duration_min, scheduled_date, exam_title });
  if (!result.success) {
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).send({
      error: z.flattenError(result.error).fieldErrors,
      message: "Data not provided in the required format",
    });
  }

  const date = new Date(scheduled_date);
  const datetime = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  const { user_id } = req;
  if (!questions)
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Questions not provided" });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const insertExam = `INSERT INTO exam (user_id, exam_code, grading ${
      duration_min ? ", duration_min" : ""
    } ${scheduled_date ? ", scheduled_date" : ""}, title) VALUES (?, ?, ? ${
      duration_min ? ", ?" : ""
    } ${scheduled_date ? ", ?" : ""} , ?)`;
    const exam_code = generateExamCode(user_id);
    const examData = [
      user_id,
      exam_code,
      grading,
      ...(duration_min ? [duration_min] : []),
      ...(scheduled_date ? [datetime] : []),
      exam_title,
    ];
    const [examResult] = await connection.query(insertExam, examData);
    const exam_id = examResult.insertId;
    for (const question of questions) {
      const insertQuestion = `INSERT INTO question (exam_id, title ${
        grading !== "no-grading" ? ", marks" : ""
      }, question_type) VALUES (? ${grading !== "no-grading" ? ", ?" : ""}, ?, ?);`;
      const [questionResult] = await connection.query(insertQuestion, [
        exam_id,
        question.title,
        ...(grading !== "no-grading" ? [question.marks] : []),
        QUESTION_TYPES[question.questionType],
      ]);
      const question_id = questionResult.insertId;

      if (question.questionType != "text") {
        for (const option of question.options) {
          const is_correct = question.correctOptions.includes(option.id);
          const insertOption =
            "INSERT INTO opt  (question_id, option_text, is_correct) VALUES (?, ?, ?);";
          const [optionResult] = await connection.query(insertOption, [
            question_id,
            option.title,
            is_correct,
          ]);
        }
      }
    }
    await connection.commit();
    res
      .status(constants.HTTP_STATUS.OK)
      .send({ message: "Exam created successfully", exam_id, exam_code });
  } catch (error) {
    await connection.rollback();
    res.status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      error,
      message: "Internal Server Error",
    });
  } finally {
    connection.release();
  }
});

export default exam;
