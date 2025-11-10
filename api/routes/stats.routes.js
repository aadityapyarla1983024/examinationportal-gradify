import express from "express";
import verfiyToken from "../middleware/global/tokenverify.middleware.js";
import db from "../db.js";

const stats = express.Router();

// Helper function to ensure 2 decimal places
const toDecimal = (value) => {
  if (value === null || value === undefined) return null;
  return parseFloat(Number(value).toFixed(2));
};

// Get comprehensive user exam statistics with all attempts
stats.post("/get-user-exam-statistics", verfiyToken, async (req, res) => {
  try {
    const { user_id } = req;

    if (!user_id) {
      return res.status(400).json({
        error: "User ID is required",
        message: "Please provide a valid user ID",
      });
    }

    // Query to get user's exam statistics with all attempts
    const userStatsQuery = `
      SELECT 
        e.id as exam_id,
        e.title as exam_title,
        e.exam_code,
        e.total_marks,
        e.evaluation,
        e.partial_marking,
        e.duration_min,
        e.scheduled_date,
        d.domain_name,
        f.field_name,
        es.total_attempts as exam_total_attempts,
        es.highest_marks as exam_highest_marks,
        es.lowest_marks as exam_lowest_marks,
        es.average_marks as exam_average_marks,
        -- User's personal stats for this exam
        COUNT(ea.id) as user_attempts,
        MAX(ea.awarded_marks) as user_highest_marks,
        MIN(ea.awarded_marks) as user_lowest_marks,
        AVG(ea.awarded_marks) as user_average_marks,
        SUM(CASE WHEN ea.awarded_marks IS NOT NULL THEN 1 ELSE 0 END) as evaluated_attempts
      FROM exam e
      JOIN domain d ON e.domain_id = d.id
      JOIN field f ON d.field_id = f.id
      LEFT JOIN exam_statistics es ON e.id = es.exam_id
      LEFT JOIN exam_attempt ea ON e.id = ea.exam_id AND ea.user_id = ?
      WHERE ea.id IS NOT NULL
      GROUP BY 
        e.id, e.title, e.exam_code, e.total_marks, e.evaluation, e.partial_marking,
        e.duration_min, e.scheduled_date, d.domain_name, f.field_name,
        es.total_attempts, es.highest_marks, es.lowest_marks, es.average_marks
      ORDER BY MAX(ea.submitted_at) DESC
    `;

    const [examStats] = await db.query(userStatsQuery, [user_id]);

    if (examStats.length === 0) {
      return res.status(404).json({
        error: "No attempts found",
        message: "No exam attempts found for this user",
      });
    }

    // Get detailed attempt history for each exam
    const detailedAttemptsQuery = `
      SELECT 
        ea.exam_id,
        ea.id as attempt_id,
        ea.awarded_marks,
        ea.started_at,
        ea.submitted_at,
        e.total_marks,
        TIMESTAMPDIFF(MINUTE, ea.started_at, ea.submitted_at) as time_taken_minutes,
        (ea.awarded_marks / e.total_marks * 100) as percentage
      FROM exam_attempt ea
      JOIN exam e ON ea.exam_id = e.id
      WHERE ea.user_id = ? 
      AND ea.submitted_at IS NOT NULL
      ORDER BY ea.submitted_at DESC
    `;

    const [allAttempts] = await db.query(detailedAttemptsQuery, [user_id]);

    // Group attempts by exam
    const attemptsByExam = {};
    allAttempts.forEach((attempt) => {
      if (!attemptsByExam[attempt.exam_id]) {
        attemptsByExam[attempt.exam_id] = [];
      }
      attemptsByExam[attempt.exam_id].push({
        attempt_id: attempt.attempt_id,
        awarded_marks: toDecimal(attempt.awarded_marks),
        total_marks: toDecimal(attempt.total_marks),
        percentage: toDecimal(attempt.percentage),
        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
        time_taken_minutes: attempt.time_taken_minutes,
        status: attempt.awarded_marks !== null ? "evaluated" : "pending",
      });
    });

    // Combine statistics with detailed attempts
    const result = examStats.map((stat) => ({
      exam_id: stat.exam_id,
      exam_title: stat.exam_title,
      exam_code: stat.exam_code,
      total_marks: toDecimal(stat.total_marks),
      evaluation: stat.evaluation,
      partial_marking: Boolean(stat.partial_marking),
      domain_name: stat.domain_name,
      field_name: stat.field_name,
      duration_min: stat.duration_min,
      scheduled_date: stat.scheduled_date,

      // Overall exam statistics (pre-calculated)
      overall_statistics: {
        total_attempts: stat.exam_total_attempts,
        highest_marks: toDecimal(stat.exam_highest_marks),
        lowest_marks: toDecimal(stat.exam_lowest_marks),
        average_marks: toDecimal(stat.exam_average_marks),
      },

      // User's personal statistics for this exam
      user_statistics: {
        total_attempts: stat.user_attempts,
        evaluated_attempts: stat.evaluated_attempts,
        highest_marks: toDecimal(stat.user_highest_marks),
        lowest_marks: toDecimal(stat.user_lowest_marks),
        average_marks: toDecimal(stat.user_average_marks),
        best_percentage:
          stat.user_highest_marks !== null
            ? toDecimal((stat.user_highest_marks / stat.total_marks) * 100)
            : null,
        average_percentage:
          stat.user_average_marks !== null
            ? toDecimal((stat.user_average_marks / stat.total_marks) * 100)
            : null,
      },

      // Detailed attempts history
      attempts_history: attemptsByExam[stat.exam_id] || [],
    }));

    res.json({
      success: true,
      message: "User exam statistics retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching user exam statistics:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Unable to retrieve user exam statistics",
    });
  }
});

// Get specific exam statistics with user's attempts
stats.post("/get-exam-statistics", verfiyToken, async (req, res) => {
  try {
    const { exam_id } = req.body;
    const { user_id } = req;

    if (!exam_id) {
      return res.status(400).json({
        error: "Exam ID is required",
        message: "Please provide a valid exam ID",
      });
    }

    const examStatsQuery = `
      SELECT 
        e.id as exam_id,
        e.title as exam_title,
        e.exam_code,
        e.total_marks,
        e.evaluation,
        e.partial_marking,
        es.total_attempts,
        es.highest_marks,
        es.lowest_marks,
        es.average_marks,
        -- User specific stats
        COUNT(CASE WHEN ea.user_id = ? THEN 1 END) as user_attempts,
        MAX(CASE WHEN ea.user_id = ? THEN ea.awarded_marks END) as user_highest_marks,
        MIN(CASE WHEN ea.user_id = ? THEN ea.awarded_marks END) as user_lowest_marks,
        AVG(CASE WHEN ea.user_id = ? THEN ea.awarded_marks END) as user_average_marks,
        -- Recent attempts count (last 30 days)
        COUNT(CASE WHEN ea.submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_attempts
      FROM exam e
      LEFT JOIN exam_statistics es ON e.id = es.exam_id
      LEFT JOIN exam_attempt ea ON e.id = ea.exam_id AND ea.submitted_at IS NOT NULL
      WHERE e.id = ?
      GROUP BY e.id, e.title, e.exam_code, e.total_marks, e.evaluation, e.partial_marking,
               es.total_attempts, es.highest_marks, es.lowest_marks, es.average_marks
    `;

    const [stats] = await db.query(examStatsQuery, [
      user_id,
      user_id,
      user_id,
      user_id,
      exam_id,
    ]);

    if (stats.length === 0 || !stats[0].exam_id) {
      return res.status(404).json({
        error: "Exam not found",
        message: "No exam found with the provided ID",
      });
    }

    // Get user's detailed attempts for this exam
    const userAttemptsQuery = `
      SELECT 
        id as attempt_id,
        awarded_marks,
        started_at,
        submitted_at,
        TIMESTAMPDIFF(MINUTE, started_at, submitted_at) as time_taken_minutes,
        (awarded_marks / ? * 100) as percentage
      FROM exam_attempt 
      WHERE exam_id = ? 
      AND user_id = ?
      AND submitted_at IS NOT NULL
      ORDER BY submitted_at DESC
    `;

    const [userAttempts] = await db.query(userAttemptsQuery, [
      stats[0].total_marks,
      exam_id,
      user_id,
    ]);

    const result = {
      exam_id: stats[0].exam_id,
      exam_title: stats[0].exam_title,
      exam_code: stats[0].exam_code,
      total_marks: toDecimal(stats[0].total_marks),
      evaluation: stats[0].evaluation,
      partial_marking: Boolean(stats[0].partial_marking),
      statistics: {
        total_attempts: stats[0].total_attempts || 0,
        highest_marks: toDecimal(stats[0].highest_marks),
        lowest_marks: toDecimal(stats[0].lowest_marks),
        average_marks: toDecimal(stats[0].average_marks),
        recent_attempts: stats[0].recent_attempts || 0,
      },
      user_statistics: {
        total_attempts: stats[0].user_attempts || 0,
        highest_marks: toDecimal(stats[0].user_highest_marks),
        lowest_marks: toDecimal(stats[0].user_lowest_marks),
        average_marks: toDecimal(stats[0].user_average_marks),
        best_percentage:
          stats[0].user_highest_marks !== null
            ? toDecimal(
                (stats[0].user_highest_marks / stats[0].total_marks) * 100
              )
            : null,
        average_percentage:
          stats[0].user_average_marks !== null
            ? toDecimal(
                (stats[0].user_average_marks / stats[0].total_marks) * 100
              )
            : null,
      },
      user_attempts: userAttempts.map((attempt) => ({
        attempt_id: attempt.attempt_id,
        awarded_marks: toDecimal(attempt.awarded_marks),
        percentage: toDecimal(attempt.percentage),
        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
        time_taken_minutes: attempt.time_taken_minutes,
        status: attempt.awarded_marks !== null ? "evaluated" : "pending",
      })),
    };

    res.json({
      success: true,
      message: "Exam statistics retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching exam statistics:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Unable to retrieve exam statistics",
    });
  }
});

// Get user's overall performance across all exams
stats.post("/get-user-overall-statistics", verfiyToken, async (req, res) => {
  try {
    const { user_id } = req;

    if (!user_id) {
      return res.status(400).json({
        error: "User ID is required",
        message: "Please provide a valid user ID",
      });
    }

    // Query to get overall statistics
    const overallStatsQuery = `
      SELECT 
        COUNT(DISTINCT ea.exam_id) as total_exams_attempted,
        COUNT(ea.id) as total_attempts,
        SUM(CASE WHEN ea.awarded_marks IS NOT NULL THEN 1 ELSE 0 END) as evaluated_attempts,
        AVG(ea.awarded_marks) as overall_average_marks,
        MAX(ea.awarded_marks) as best_marks,
        MIN(ea.awarded_marks) as worst_marks,
        SUM(CASE WHEN (ea.awarded_marks / e.total_marks * 100) >= 60 THEN 1 ELSE 0 END) as passed_exams,
        AVG(CASE WHEN ea.awarded_marks IS NOT NULL THEN (ea.awarded_marks / e.total_marks * 100) ELSE NULL END) as overall_percentage,
        SUM(TIMESTAMPDIFF(MINUTE, ea.started_at, ea.submitted_at)) as total_time_spent_minutes
      FROM exam_attempt ea
      JOIN exam e ON ea.exam_id = e.id
      WHERE ea.user_id = ?
      AND ea.submitted_at IS NOT NULL
    `;

    const [stats] = await db.query(overallStatsQuery, [user_id]);

    // Query to get recent attempts
    const recentAttemptsQuery = `
      SELECT 
        ea.id as attempt_id,
        ea.exam_id,
        ea.awarded_marks,
        ea.started_at,
        ea.submitted_at,
        e.title as exam_title,
        e.total_marks,
        (ea.awarded_marks / e.total_marks * 100) as percentage,
        TIMESTAMPDIFF(MINUTE, ea.started_at, ea.submitted_at) as time_taken_minutes
      FROM exam_attempt ea
      JOIN exam e ON ea.exam_id = e.id
      WHERE ea.user_id = ?
      AND ea.submitted_at IS NOT NULL
      ORDER BY ea.submitted_at DESC
      LIMIT 5
    `;

    const [recentAttempts] = await db.query(recentAttemptsQuery, [user_id]);

    // Query to get performance by domain
    const domainPerformanceQuery = `
      SELECT 
        d.domain_name,
        f.field_name,
        COUNT(ea.id) as attempts,
        AVG(ea.awarded_marks / e.total_marks * 100) as average_percentage,
        MAX(ea.awarded_marks / e.total_marks * 100) as best_percentage
      FROM exam_attempt ea
      JOIN exam e ON ea.exam_id = e.id
      JOIN domain d ON e.domain_id = d.id
      JOIN field f ON d.field_id = f.id
      WHERE ea.user_id = ?
      AND ea.submitted_at IS NOT NULL
      AND ea.awarded_marks IS NOT NULL
      GROUP BY d.domain_name, f.field_name
      ORDER BY average_percentage DESC
    `;

    const [domainPerformance] = await db.query(domainPerformanceQuery, [
      user_id,
    ]);

    const result = {
      user_id: parseInt(user_id),
      total_exams_attempted: stats[0].total_exams_attempted || 0,
      total_attempts: stats[0].total_attempts || 0,
      evaluated_attempts: stats[0].evaluated_attempts || 0,
      overall_average_marks: toDecimal(stats[0].overall_average_marks),
      best_marks: toDecimal(stats[0].best_marks),
      worst_marks: toDecimal(stats[0].worst_marks),
      passed_exams: stats[0].passed_exams || 0,
      overall_percentage: toDecimal(stats[0].overall_percentage),
      total_time_spent_minutes: stats[0].total_time_spent_minutes || 0,
      average_time_per_exam:
        stats[0].total_attempts > 0
          ? Math.round(
              stats[0].total_time_spent_minutes / stats[0].total_attempts
            )
          : 0,
      recent_attempts: recentAttempts.map((attempt) => ({
        attempt_id: attempt.attempt_id,
        exam_id: attempt.exam_id,
        exam_title: attempt.exam_title,
        awarded_marks: toDecimal(attempt.awarded_marks),
        total_marks: toDecimal(attempt.total_marks),
        percentage: toDecimal(attempt.percentage),
        submitted_at: attempt.submitted_at,
        time_taken_minutes: attempt.time_taken_minutes,
      })),
      domain_performance: domainPerformance.map((domain) => ({
        domain_name: domain.domain_name,
        field_name: domain.field_name,
        attempts: domain.attempts,
        average_percentage: toDecimal(domain.average_percentage),
        best_percentage: toDecimal(domain.best_percentage),
      })),
    };

    res.json({
      success: true,
      message: "Overall statistics retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching overall statistics:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Unable to retrieve overall statistics",
    });
  }
});

// Get top performing exams across the platform
stats.get("/get-top-exams", verfiyToken, async (req, res) => {
  try {
    const topExamsQuery = `
      SELECT 
        e.id as exam_id,
        e.title as exam_title,
        e.exam_code,
        e.total_marks,
        e.evaluation,
        e.partial_marking,
        es.total_attempts,
        es.average_marks,
        es.highest_marks,
        (es.average_marks / e.total_marks * 100) as average_percentage,
        u.first_name,
        u.last_name,
        d.domain_name
      FROM exam e
      JOIN exam_statistics es ON e.id = es.exam_id
      JOIN user u ON e.user_id = u.id
      JOIN domain d ON e.domain_id = d.id
      WHERE es.total_attempts > 0
      ORDER BY es.total_attempts DESC, average_percentage DESC
      LIMIT 10
    `;

    const [topExams] = await db.query(topExamsQuery);

    res.json({
      success: true,
      message: "Top exams retrieved successfully",
      data: topExams.map((exam) => ({
        ...exam,
        average_marks: toDecimal(exam.average_marks),
        highest_marks: toDecimal(exam.highest_marks),
        average_percentage: toDecimal(exam.average_percentage),
        total_marks: toDecimal(exam.total_marks),
      })),
    });
  } catch (error) {
    console.error("Error fetching top exams:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Unable to retrieve top exams",
    });
  }
});

export default stats;
export { toDecimal };
