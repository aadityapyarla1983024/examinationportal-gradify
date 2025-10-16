# Backend Queries

# Total exams attempted
SELECT COUNT(*) FROM exam_attempt WHERE user_id="[userid]";

# Average Score
SELECT AVG(sub.percentage_score) AS avg_percentage
FROM (
    SELECT (SUM(a.awarded_marks) / SUM(q.marks)) * 100 AS percentage_score
    FROM exam_attempt ea
    JOIN answer a ON a.exam_attempt_id = ea.id
    JOIN question q ON a.question_id = q.id
    WHERE ea.user_id = 1
    GROUP BY ea.exam_id
) AS sub;

# Maximum Score
SELECT MAX(sub.percentage_score) AS avg_percentage
FROM (
    SELECT (SUM(a.awarded_marks) / SUM(q.marks)) * 100 AS percentage_score
    FROM exam_attempt ea
    JOIN answer a ON a.exam_attempt_id = ea.id
    JOIN question q ON a.question_id = q.id
    WHERE ea.user_id = 1
    GROUP BY ea.exam_id
) AS sub;

# Total number of exams created
SELECT * FROM exam WHERE user_id=1;

# Performance History
SELECT 
    (SUM(a.awarded_marks) / SUM(q.marks)) * 100 AS percentage_score,
    ea.submitted_at, 
    SUM(a.awarded_marks) AS marks_scored, 
    SUM(q.marks) AS total_marks
FROM exam_attempt ea
JOIN answer a ON a.exam_attempt_id = ea.id
JOIN question q ON a.question_id = q.id
WHERE ea.user_id = 1
  AND ea.submitted_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
GROUP BY ea.id
ORDER BY ea.submitted_at DESC;


# Exams Created Tab
SELECT exam.title, exam.exam_code, SUM(question.marks) AS total_marks, exam.created_at, duration_min, scheduled_at FROM exam 
JOIN question ON exam.id = question.exam_id WHERE exam.user_id = 1;

#Exams Attempted Tab
SELECT ea.submitted_at,  ea.awarded_marks, e.title, e.scheduled_date
FROM exam_attempt AS ea
JOIN exam AS e ON ea.exam_id = e.id
WHERE ea.user_id = 1;


