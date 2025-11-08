import express from "express";
import db from "../db.js";
import verfiyToken from "../middleware/tokenverify.middleware.js";
import { constants } from "../../config/constants.js";
import generateExamCode from "../utilities/examcodegenerator.js";
import * as z from "zod";
import { get } from "http";
import getExam from "../middleware/getexam.middleware.js";
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
  const {
    exam_title,
    duration_min,
    scheduled_date,
    questions,
    evaluation,
    exam_type,
    level,
    exam_description,
    no_of_attempts,
    tags,
    domain,
  } = req.body;

  const result = Exam.safeParse({ duration_min, scheduled_date, exam_title });
  if (!result.success) {
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).send({
      error: z.flattenError(result.error).fieldErrors,
      message: "Data not provided in the required format",
    });
  }

  const datetime = scheduled_date
    ? new Date(scheduled_date).toISOString().slice(0, 19).replace("T", " ")
    : null;
  const { user_id } = req;
  if (!questions)
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Questions not provided" });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const insertExam = `INSERT INTO exam (user_id, exam_code, evaluation, domain_id, no_of_attempts, restriction_level, exam_type, exam_desc, duration_min, scheduled_date, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const exam_code = generateExamCode(user_id);
    const examData = [
      user_id,
      exam_code,
      evaluation,
      domain,
      no_of_attempts,
      level,
      exam_type,
      exam_description ? exam_description : null,
      duration_min ? duration_min : null,
      scheduled_date ? datetime : null,
      exam_title,
    ];
    const [examResult] = await connection.query(insertExam, examData);
    const exam_id = examResult.insertId;

    if (exam_type === "public-exam") {
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        throw new Error("Tags must be provided for public exams");
      }
      const existingTagsQuery = `SELECT * FROM tag WHERE tag_name IN (?);`;
      const [existingTagsRows] = await connection.query(existingTagsQuery, [
        tags,
      ]);
      const existingTagNames = existingTagsRows.map((row) => row.tag_name);

      const newTags = tags.filter((tag) => !existingTagNames.includes(tag));
      const updatedTags = existingTagsRows;
      for (const tag of newTags) {
        const insertTagQuery = `INSERT INTO tag (tag_name) VALUES (?);`;
        const [insertTagResult] = await connection.query(insertTagQuery, [tag]);
        updatedTags.push({ id: insertTagResult.insertId, tag_name: tag });
      }

      for (const tag of updatedTags) {
        const insertExamTagQuery = "INSERT INTO exam_tag VALUES (?, ?)";
        await connection.query(insertExamTagQuery, [exam_id, tag.id]);
      }
    }

    for (const question of questions) {
      const insertQuestion = `INSERT INTO question (exam_id, title ${
        evaluation !== "no" ? ", marks" : ""
      }, question_type) VALUES (? ${evaluation !== "no" ? ", ?" : ""}, ?, ?);`;
      const [questionResult] = await connection.query(insertQuestion, [
        exam_id,
        question.title,
        ...(evaluation !== "no" ? [question.marks] : []),
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

exam.get("/get-tags", verfiyToken, async (req, res) => {
  try {
    const getTagQuery = "SELECT * FROM tag";
    const [results] = await db.query(getTagQuery);
    return res.send(results);
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
});

exam.get("/get-domains", verfiyToken, async (req, res) => {
  try {
    const getDomainQuery = "SELECT * FROM domain";
    const [results] = await db.query(getDomainQuery);
    return res.send(results);
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
});

exam.get("/get-fields", verfiyToken, async (req, res) => {
  try {
    const getFieldQuery = "SELECT * FROM field";
    const [results] = await db.query(getFieldQuery);
    return res.send(results);
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
});

exam.post("/get-exam", verfiyToken, getExam, (req, res) => {
  return res.send(req.exam);
});

exam.get("/public-exams", verfiyToken, async (req, res) => {
  try {
    const getPublicExams = `
    SELECT exam_code, evaluation, title, exam_desc, domain_name, field_name, 
    no_of_attempts, duration_min, scheduled_date, e.created_at, first_name, last_name 
    FROM exam AS e 
    JOIN user ON user_id = user.id
    JOIN domain AS d ON domain_id = d.id 
    JOIN field ON field_id=field.id WHERE exam_type='public-exam'
    `;
    const [exams] = await db.query(getPublicExams);
    return res.send(exams);
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
});

export default exam;
