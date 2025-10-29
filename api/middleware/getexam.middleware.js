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
    const [examResult] = await connection.query(getExam, [excode]);
    if (examResult.length === 0) {
      connection.rollback();
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "There is no exam with the provided exam code" });
    }
    const {
      id,
      user_id,
      exam_code,
      grading,
      title,
      duration_min,
      scheduled_date,
    } = examResult[0];

    let finalExam = {
      id,
      created_by: "",
      grading,
      exam_code,
      total_marks: 0,
      title,
      duration_min,
      scheduled_date,
      questions: [],
    };

    const getQuestions = "SELECT * FROM question WHERE exam_id=?";
    const [questionResult] = await connection.query(getQuestions, [
      examResult[0].id,
    ]);
    finalExam.total_marks = questionResult.reduce(
      (acc, curr) => (acc += curr.marks),
      0
    );
    for (let question of questionResult) {
      const getOptions = "SELECT * FROM opt WHERE question_id=?";
      const [optionResult] = await connection.query(getOptions, [question.id]);
      const { exam_id, ...questionWithoutExamId } = question;
      const fullQuestion = {
        ...questionWithoutExamId,
        options: (() =>
          optionResult.map(
            ({ question_id, option_text, is_correct, ...rest }) => ({
              ...rest,
              title: option_text,
            })
          ))(),
        correctOptions: optionResult
          .filter((option) => option.is_correct === 1)
          .map((option) => option.id),
      };
      finalExam.questions.push(fullQuestion);
    }

    const getUser = "SELECT * FROM user WHERE id=?;";
    const [userResult] = await connection.query(getUser, [user_id]);

    finalExam.created_by = `${userResult[0].first_name} ${userResult[0].last_name}`;

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
