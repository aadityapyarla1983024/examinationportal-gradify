import express from "express";
import db from "../db.js";
import verfiyToken from "../middleware/tokenverify.middleware.js";
import { constants } from "../../config/constants.js";
import generateExamCode from "../utilities/examcodegenerator.js";
import * as z from "zod";
import getExam from "../middleware/getexam.middleware.js";

const exam = express.Router();

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
  const { exam_title, duration_min, scheduled_date, questions, grading } =
    req.body;

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
    const insertExam = `INSERT INTO exam (user_id, exam_code, grading, domain_id, no_of_attempts, exam_type ${
      exam_description ? ", exam_desc" : ""
    } ${duration_min ? ", duration_min" : ""} ${
      scheduled_date ? ", scheduled_date" : ""
    }, title) VALUES (?, ?, ?, ?, ?, ? ${duration_min ? ", ?" : ""} ${
      scheduled_date ? ", ?" : ""
    } ${
      exam_description ? ", ?" : ""
    } , ?)`;
    const exam_code = generateExamCode(user_id);
    const examData = [
      user_id,
      exam_code,
      grading,
      domain,
      no_of_attempts,
      exam_type,
      ...(exam_description ? [exam_description] : []),
      ...(duration_min ? [duration_min] : []),
      ...(scheduled_date ? [datetime] : []),
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
        grading !== "no-grading" ? ", marks" : ""
      }, question_type) VALUES (? ${
        grading !== "no-grading" ? ", ?" : ""
      }, ?, ?);`;
      }, question_type) VALUES (? ${
        grading !== "no-grading" ? ", ?" : ""
      }, ?, ?);`;
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

exam.post("/get-exam", verfiyToken, getExam, async (req, res) => {
  const { exam } = req;
  const returnExam = {
    ...exam,
    questions: exam.questions.map((question) => {
      const { correctOptions, ...questionWithoutCorrectOptions } = question;
      return {
        ...questionWithoutCorrectOptions,
      };
    }),
  };

  return res.send(returnExam);
});

export default exam;
