import db from "../db.js";
import { constants } from "../../config/constants.js";
async function getExam(req, res, next) {
  const excode = req.body.excode;
  if (!excode) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Exam code required" });
  }
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const getExam = "SELECT * FROM exam WHERE exam_code=?";
    const [exam] = await connection.query(getExam, [excode]);
    if (exam.length === 0) {
      connection.rollback();
      return res
        .status(constants.HTTP_STATUS.NOT_FOUND)
        .send({ message: "There is no exam with the provided exam code" });
    }
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
    } = exam[0];

    const statsQuery =
      "SELECT SUM(marks) AS m, COUNT(*) AS c FROM question WHERE exam_id=?";
    const [stats] = await connection.query(statsQuery, [id]);
    let finalExam = {
      id,
      created_by: "",
      exam_code,
      title,
      domain_id,
      restriction_level,
      evaluation,
      total_marks: stats[0].m,
      question_count: stats[0].c,
      exam_desc,
      exam_type,
      no_of_attempts,
      duration_min,
      scheduled_date,
      questions: [],
    };
    const categoryQuery =
      "SELECT domain_name,field_name, field.id AS field_id FROM domain JOIN field ON field.id = domain.field_id WHERE domain.id=?";

    const [categoryResult] = await connection.query(categoryQuery, [domain_id]);

    finalExam.field_id = categoryResult[0].field_id;
    finalExam.field_name = categoryResult[0].field_name;
    finalExam.domain_name = categoryResult[0].domain_name;

    const getQuestions = "SELECT * FROM question WHERE exam_id=?";
    const [questions] = await connection.query(getQuestions, [exam[0].id]);
    for (let question of questions) {
      const getOptions = "SELECT * FROM opt WHERE question_id=?";
      const [options] = await connection.query(getOptions, [question.id]);
      const { exam_id, ...questionWithoutExamId } = question;
      const fullQuestion = {
        ...questionWithoutExamId,
        options: (() =>
          options.map(({ question_id, option_text, is_correct, ...rest }) => ({
            ...rest,
            title: option_text,
          })))(),
        correctOptions: options
          .filter((option) => option.is_correct == true)
          .map((option) => option.id),
      };
      finalExam.questions.push(fullQuestion);
    }

    const getUser = "SELECT * FROM user WHERE id=?;";
    const [user] = await connection.query(getUser, [user_id]);

    finalExam.created_by = `${user[0].first_name} ${user[0].last_name}`;

    await connection.commit();
    req.exam = finalExam;
    next();
    return;
  } catch (error) {
    res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
    return await connection.rollback();
  } finally {
    connection.release();
  }
}

export default getExam;
