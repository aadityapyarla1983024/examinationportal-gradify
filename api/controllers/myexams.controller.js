import db from "../db.js";
import { constants } from "../../config/constants.js";

export const getUserExams = async (req, res) => {
  const { user_id } = req;
  const connection = await db.getConnection();

  try {
    // ====== Fetch exams created by user ======
    const getExamsQuery = `
      SELECT 
        title, e.id, duration_min, scheduled_date, exam_code, no_of_attempts, 
        created_at, exam_type, domain_name, field_name 
      FROM exam AS e 
      JOIN domain AS d ON e.domain_id = d.id 
      JOIN field ON d.field_id = field.id 
      WHERE user_id = ? 
      ORDER BY created_at DESC`;
    let [exams] = await connection.query(getExamsQuery, [user_id]);

    // ====== Add stats for each created exam ======
    for (let i = 0; i < exams.length; i++) {
      const statsQuery = `
        SELECT 
          COUNT(*) AS total_attempts, 
          MAX(awarded_marks) AS max, 
          AVG(awarded_marks) AS avg, 
          MIN(awarded_marks) AS min 
        FROM exam_attempt 
        WHERE exam_id = ?`;
      const [stats] = await connection.query(statsQuery, [exams[i].id]);

      const totalMarksQuery =
        "SELECT SUM(marks) AS total_marks FROM question WHERE exam_id=?";
      const [totalMarks] = await connection.query(totalMarksQuery, [
        exams[i].id,
      ]);

      exams[i].total_marks = totalMarks[0].total_marks;
      exams[i].max = stats[0].max;
      exams[i].avg = stats[0].avg;
      exams[i].min = stats[0].min;
    }

    // ====== Fetch all exam attempts by user ======
    const getAttemptsQuery = `
      SELECT 
        a.id AS id, submitted_at, awarded_marks, exam_id, title, scheduled_date, 
        exam_type, restriction_level, duration_min, exam_code, evaluation, 
        domain_name, field_name 
      FROM exam_attempt AS a 
      JOIN exam AS e ON a.exam_id = e.id 
      JOIN domain AS d ON e.domain_id = d.id 
      JOIN field ON d.field_id = field.id 
      WHERE a.user_id = ? 
      ORDER BY submitted_at DESC`;
    const [allAttempts] = await connection.query(getAttemptsQuery, [user_id]);

    // ====== Add stats to each attempt ======
    for (let i = 0; i < allAttempts.length; i++) {
      const { exam_id } = allAttempts[i];

      const getTotalMarks =
        "SELECT SUM(marks) AS total FROM question WHERE exam_id=?";
      const [totalMarks] = await connection.query(getTotalMarks, [exam_id]);

      const statsQuery =
        "SELECT MAX(awarded_marks) AS max, AVG(awarded_marks) AS avg FROM exam_attempt WHERE exam_id=?";
      const [statsResult] = await connection.query(statsQuery, [exam_id]);

      allAttempts[i].total_marks = totalMarks[0].total;
      allAttempts[i].max = statsResult[0].max;
      allAttempts[i].avg = statsResult[0].avg;
    }

    // ====== Group attempts by exam_id ======
    const groupedAttempts = {};
    for (const attempt of allAttempts) {
      if (!groupedAttempts[attempt.exam_id])
        groupedAttempts[attempt.exam_id] = [];
      groupedAttempts[attempt.exam_id].push(attempt);
    }

    // ====== Number attempts sequentially ======
    Object.values(groupedAttempts).forEach((group) => {
      group.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
      group.forEach((attempt, index) => {
        attempt.attempt_number = index + 1;
      });
    });

    // ====== Flatten and sort by submission time ======
    const attempts = Object.values(groupedAttempts).flat();
    attempts.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

    // ====== Respond ======
    return res.send({
      attempts,
      created: exams,
    });
  } catch (error) {
    console.error("Error in getUserExams:", error);
    res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
};
