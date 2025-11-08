export async function getAnswersForEvaluation(req, res) {
  const { exam } = req;
  const { exam_attempt_id } = req.body;
  const connection = await db.getConnection();
  try {
    const [attempt] = await connection.query(
      "SELECT * FROM exam_attempt WHERE id=?",
      [exam_attempt_id]
    );

    if (attempt.length === 0) {
      return res
        .status(constants.HTTP_STATUS.NOT_FOUND)
        .send({ message: "Attempt not found" });
    }

    if (attempt[0].evaluation === "no") {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "This exam cannot be evaluated" });
    }

    if (attempt[0].awarded_marks === null && attempt[0].evaluation !== "no") {
      const [answers] = await connection.query(
        "SELECT * FROM answer WHERE exam_attempt_id=? AND awarded_marks IS NULL",
        [exam_attempt_id]
      );

      for (const answer of answers) {
        const [text] = await connection.query(
          "SELECT * FROM text_answer WHERE answer_id=?",
          [answer.id]
        );
        answer.text_answer = text?.[0]?.answer_text || "";
      }

      return res.send({ answers, exam });
    } else {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "The exam has already been evaluated" });
    }
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
}

export async function submitEvaluation(req, res) {
  const { exam } = req;
  const { answers, exam_attempt_id } = req.body;
  const connection = await db.getConnection();

  try {
    const [attempt] = await connection.query(
      "SELECT * FROM exam_attempt WHERE id=?",
      [exam_attempt_id]
    );

    if (attempt[0].awarded_marks != null) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "This attempt is already evaluated" });
    }

    let attempt_marks = 0;

    const [dbAnswers] = await connection.query(
      "SELECT * FROM answer WHERE exam_attempt_id=?",
      [exam_attempt_id]
    );

    for (const answer of dbAnswers) {
      const question = exam.questions.find((q) => q.id === answer.question_id);

      if (question.question_type !== "text") {
        const [mcq] = await connection.query(
          "SELECT * FROM mcq_answer WHERE answer_id=?",
          [answer.id]
        );

        const selectedOptions = mcq.map((m) => m.option_id);
        const isCorrect =
          selectedOptions.length === question.correctOptions.length &&
          question.correctOptions.every((opt) => selectedOptions.includes(opt));

        if (isCorrect) attempt_marks += question.marks;
      } else {
        const evaluatedMarks =
          answers.find((a) => a.id === answer.id)?.awarded_marks || 0;
        await connection.query("UPDATE answer SET awarded_marks=? WHERE id=?", [
          evaluatedMarks,
          answer.id,
        ]);
        attempt_marks += evaluatedMarks;
      }
    }

    await connection.query(
      "UPDATE exam_attempt SET awarded_marks=? WHERE id=?",
      [attempt_marks, exam_attempt_id]
    );

    return res.send({ message: "Successfully submitted your evaluation" });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
}
