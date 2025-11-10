import db from "../db.js";
import { constants } from "../../config/constants.js";
import generateExamCode from "../utilities/exam/examcodegenerator.js";
import * as z from "zod";

const QUESTION_TYPES = {
  "single-choice": 1,
  "multi-choice": 2,
  text: 3,
};

const ExamSchema = z.object({
  duration_min: z.number().optional(),
  exam_title: z.string({
    required_error: "Exam title is required",
    invalid_type_error: "Exam title cannot be null",
  }),
  scheduled_date: z.string().optional(),
});

// Function to initialize exam statistics
const initializeExamStatistics = async (connection, exam_id) => {
  try {
    const insertStatsQuery = `
      INSERT INTO exam_statistics (exam_id, total_attempts, highest_marks, lowest_marks, average_marks) 
      VALUES (?, 0, 0, 0, 0)
    `;
    await connection.query(insertStatsQuery, [exam_id]);
  } catch (error) {
    console.error("Error initializing exam statistics:", error);
    throw error;
  }
};

// Helper function to ensure 2 decimal places
const toDecimal = (value) => {
  if (value === null || value === undefined) return null;
  return parseFloat(Number(value).toFixed(2));
};

// ========================= CREATE NEW EXAM =========================
export const createNewExam = async (req, res) => {
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
    total_marks,
    partial_marking = false, // Added partial_marking
  } = req.body;

  const result = ExamSchema.safeParse({
    duration_min,
    scheduled_date,
    exam_title,
  });
  if (!result.success) {
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).send({
      error: z.flatten(result.error).fieldErrors,
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

    const exam_code = generateExamCode(user_id);
    const insertExam = `
      INSERT INTO exam 
      (user_id, exam_code, evaluation, domain_id, no_of_attempts, restriction_level, 
       exam_type, exam_desc, duration_min, scheduled_date, title, total_marks, partial_marking)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const examData = [
      user_id,
      exam_code,
      evaluation,
      domain,
      no_of_attempts,
      level,
      exam_type,
      exam_description || null,
      duration_min || null,
      datetime,
      exam_title,
      toDecimal(total_marks), // Use decimal conversion
      partial_marking, // Added partial_marking
    ];

    const [examResult] = await connection.query(insertExam, examData);
    const exam_id = examResult.insertId;

    // Initialize exam statistics
    await initializeExamStatistics(connection, exam_id);

    // ====== Handle Public Exam Tags ======
    if (exam_type === "public-exam") {
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        throw new Error("Tags must be provided for public exams");
      }

      const [existingTags] = await connection.query(
        "SELECT * FROM tag WHERE tag_name IN (?);",
        [tags]
      );

      const existingTagNames = existingTags.map((t) => t.tag_name);
      const newTags = tags.filter((t) => !existingTagNames.includes(t));
      const updatedTags = [...existingTags];

      for (const tag of newTags) {
        const [insertTag] = await connection.query(
          "INSERT INTO tag (tag_name) VALUES (?);",
          [tag]
        );
        updatedTags.push({ id: insertTag.insertId, tag_name: tag });
      }

      for (const tag of updatedTags) {
        await connection.query("INSERT INTO exam_tag VALUES (?, ?)", [
          exam_id,
          tag.id,
        ]);
      }
    }

    // ====== Insert Questions and Options ======
    for (const question of questions) {
      const insertQuestion = `
        INSERT INTO question (exam_id, title ${
          evaluation !== "no" ? ", marks" : ""
        }, question_type)
        VALUES (? ${evaluation !== "no" ? ", ?" : ""}, ?, ?);
      `;

      const params = [
        exam_id,
        question.title,
        ...(evaluation !== "no" ? [toDecimal(question.marks)] : []), // Use decimal conversion
        QUESTION_TYPES[question.questionType],
      ];

      const [questionResult] = await connection.query(insertQuestion, params);
      const question_id = questionResult.insertId;

      if (question.questionType !== "text") {
        for (const option of question.options) {
          const is_correct = question.correctOptions.includes(option.id);
          await connection.query(
            "INSERT INTO opt (question_id, option_text, is_correct) VALUES (?, ?, ?);",
            [question_id, option.title, is_correct]
          );
        }
      }
    }

    await connection.commit();
    return res.status(constants.HTTP_STATUS.OK).send({
      message: "Exam created successfully",
      exam_id,
      exam_code,
    });
  } catch (error) {
    await connection.rollback();
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
};

// ========================= GET TAGS =========================
export const getTags = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM tag");
    return res.send(results);
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};

// ========================= GET DOMAINS =========================
export const getDomains = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM domain");
    return res.send(results);
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};

// ========================= GET FIELDS =========================
export const getFields = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM field");
    return res.send(results);
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};

// ========================= GET EXAM =========================
export const getExamDetails = (req, res) => {
  return res.send(req.exam);
};

// ========================= PUBLIC EXAMS =========================
export const getPublicExams = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id as exam_id,
        e.exam_code, e.evaluation, e.title, e.exam_desc, e.partial_marking,
        d.domain_name, f.field_name,
        e.no_of_attempts, e.duration_min, e.scheduled_date, e.created_at, 
        u.first_name, u.last_name, u.profile,
        es.total_attempts, es.highest_marks, es.average_marks
      FROM exam AS e
      JOIN user u ON e.user_id = u.id
      JOIN domain AS d ON e.domain_id = d.id
      JOIN field f ON d.field_id = f.id
      LEFT JOIN exam_statistics es ON e.id = es.exam_id
      WHERE e.exam_type = 'public-exam'
    `;
    const [exams] = await db.query(query);
    return res.send(exams);
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};
