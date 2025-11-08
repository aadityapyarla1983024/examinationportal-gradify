import db from "../../db.js";
import { constants } from "../../../config/constants.js";

export default async function getExam(req, res, next) {
  const excode = req.body.excode;
  if (!excode) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Exam code required" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch base exam info
    const [examResult] = await connection.query(
      "SELECT * FROM exam WHERE exam_code=?",
      [excode]
    );
    if (examResult.length === 0) {
      await connection.rollback();
      return res
        .status(constants.HTTP_STATUS.NOT_FOUND)
        .send({ message: "There is no exam with the provided exam code" });
    }

    const exam = examResult[0];
    const {
      id,
      user_id,
      exam_code,
      evaluation,
      title,
      restriction_level,
      domain_id,
      exam_desc,
      exam_type,
      no_of_attempts,
      duration_min,
      scheduled_date,
    } = exam;

    // Basic stats
    const [stats] = await connection.query(
      "SELECT SUM(marks) AS total_marks, COUNT(*) AS total_questions FROM question WHERE exam_id=?",
      [id]
    );

    const finalExam = {
      id,
      created_by: "",
      exam_code,
      title,
      domain_id,
      restriction_level,
      evaluation,
      total_marks: stats[0].total_marks,
      question_count: stats[0].total_questions,
      exam_desc,
      exam_type,
      no_of_attempts,
      duration_min,
      scheduled_date,
      questions: [],
    };

    // Domain + Field info
    const [categoryResult] = await connection.query(
      `SELECT domain_name, field_name, field.id AS field_id 
       FROM domain 
       JOIN field ON field.id = domain.field_id 
       WHERE domain.id=?`,
      [domain_id]
    );

    if (categoryResult.length > 0) {
      finalExam.field_id = categoryResult[0].field_id;
      finalExam.field_name = categoryResult[0].field_name;
      finalExam.domain_name = categoryResult[0].domain_name;
    }

    // Fetch questions + options
    const [questions] = await connection.query(
      "SELECT * FROM question WHERE exam_id=?",
      [id]
    );
    for (const question of questions) {
      const [options] = await connection.query(
        "SELECT * FROM opt WHERE question_id=?",
        [question.id]
      );

      const formattedQuestion = {
        ...question,
        options: options.map(({ option_text, is_correct, ...rest }) => ({
          ...rest,
          title: option_text,
        })),
        correctOptions: options
          .filter((opt) => opt.is_correct)
          .map((opt) => opt.id),
      };

      delete formattedQuestion.exam_id;
      finalExam.questions.push(formattedQuestion);
    }

    // Creator info
    const [user] = await connection.query(
      "SELECT first_name, last_name FROM user WHERE id=?",
      [user_id]
    );
    if (user.length > 0) {
      finalExam.created_by = `${user[0].first_name} ${user[0].last_name}`;
    }

    await connection.commit();

    req.exam = finalExam;
    return next();
  } catch (error) {
    await connection.rollback();
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
}
