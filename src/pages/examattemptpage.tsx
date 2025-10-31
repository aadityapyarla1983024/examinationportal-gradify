//@ts-nocheck
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TextareaDebounce } from "@/components/ui/textarea";
import {
  MultiChoiceOptions,
  SingleChoiceOptions,
} from "@/components/ui/shadcn-io/radio-group/newquestionoptions";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "@/App";
import { toast } from "react-toastify";

const Timer = ({ duration_min, started_at, autoSubmit, exam_attempt_id }) => {
  const [redTimer, setRedTimer] = useState(false);
  const startedAt = new Date(started_at);
  const submitAt = startedAt.getTime() + duration_min * 60 * 1000;
  const now = new Date();
  const timeLeft = submitAt - now.getTime();
  const [timer, setTimer] = useState(timeLeft / 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          autoSubmit(exam_attempt_id);
          return 0;
        }
        if (prev <= 600) {
          setRedTimer(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = Math.floor(timer % 60);
  return (
    <div className="fixed right-5 top-5">
      <Card className="p-5">
        <CardTitle>
          Remaining Time:
          {` ${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`}
        </CardTitle>
      </Card>
    </div>
  );
};

export default function ExamAttemptPage() {
  const [exam, setExam] = useState();
  const { excode } = useParams();
  const [examLoading, setExamLoading] = useState(true);
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const { protocol, localIp } = useContext(UserContext);
  const [answers, setAnswers] = useState(
    (() => {
      try {
        const storedAnswers = localStorage.getItem("attempt");
        return storedAnswers ? JSON.parse(`${storedAnswers}`) : [];
      } catch (error) {
        console.error("Error parsing stored answers:", error);
        return [];
      }
    })()
  );

  useEffect(() => {
    setExamLoading(true);
    const processAttempt = async () => {
      const user_token = localStorage.getItem("token");

      const fetchedExam = await fetchExam(user_token);
      setExam(fetchedExam);

      const fetchedAttempt = await initializeAttempt(user_token);
      setAttempt(fetchedAttempt);
      if (fetchedExam && fetchedAttempt) {
        setExamLoading(false);
      }
    };
    processAttempt();
  }, []);

  const initializeAttempt = async (user_token) => {
    try {
      const res = await axios.post(
        `${protocol}://${localIp}:3000/api/attempt/start-attempt`,
        { excode },
        {
          headers: {
            ["x-auth-token"]: user_token,
          },
        }
      );
      return res.data;
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.error);
        toast.error(error.response.data.message);
      } else {
        console.log(error);
        toast.error("Something went wrong with the fetch exam request");
      }
      return null;
    }
  };

  const fetchExam = async (user_token) => {
    try {
      const res = await axios.post(
        `${protocol}://${localIp}:3000/api/exam/get-exam`,
        { excode },
        {
          headers: {
            ["x-auth-token"]: user_token,
          },
        }
      );
      return res.data;
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.error);
        toast.error(error.response.data.message);
      } else {
        console.log(error);
        toast.error("Something went wrong with the fetch exam request");
      }
      navigate("/dashboard/enter-exam");
    }
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      localStorage.setItem("attempt", JSON.stringify(answers));
    }, 1000);
    return () => clearTimeout(timerId);
  }, [answers]);

  const submitExam = () => {
    const reqBody = {
      excode,
      answers,
      exam_attempt_id: attempt.exam_attempt_id,
    };
    const apiendpoint = `${protocol}://${localIp}:3000/api/attempt/submit-exam`;
    axios
      .post(apiendpoint, reqBody, {
        headers: {
          ["x-auth-token"]: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        toast.success(res.data.message);
        localStorage.removeItem("attempt");
        navigate("/dashboard/myexams");
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.data.error);
          toast.error(error.response.data.message);
        } else if (error.request) {
          toast.error("No response recieved");
          console.log(error.request);
        } else {
          toast.error("Request error");
          console.log(error.message);
        }
      });
  };

  const onCheckChange = (isChecked, optionId, questionId) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const index = newAnswers.findIndex(
        (answer) => answer.question_id == questionId
      );
      if (index != -1) {
        const existingAnswer = newAnswers[index];
        let updatedOptions = existingAnswer.answeredOptions;

        if (isChecked) {
          updatedOptions = [...updatedOptions, optionId];
        } else {
          updatedOptions = existingAnswer.answeredOptions.filter(
            (option) => option != optionId
          );
        }
        newAnswers[index] = {
          ...existingAnswer,
          answeredOptions: updatedOptions,
        };
      } else if (isChecked) {
        const newAnswer = {
          question_id: questionId,
          answeredOptions: [optionId],
        };
        newAnswers.push(newAnswer);
      }
      return newAnswers;
    });
  };

  const singleChoiceChange = (optionId, question_id) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const index = newAnswers.findIndex(
        (answer) => answer.question_id === question_id
      );
      if (index != -1) {
        const existingAnswer = newAnswers[index];
        const updatedOptions = [optionId];
        newAnswers[index] = {
          ...existingAnswer,
          answeredOptions: updatedOptions,
        };
      } else {
        const newAnswer = {
          question_id,
          answeredOptions: [optionId],
        };
        newAnswers.push(newAnswer);
      }
      return newAnswers;
    });
  };

  const textAnswerChange = (textAnswer, question_id) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const index = newAnswers.findIndex(
        (answer) => answer.question_id === question_id
      );
      if (index != -1) {
        const existingAnswer = newAnswers[index];
        newAnswers[index] = { ...existingAnswer, textAnswer };
      } else {
        const newAnswer = {
          question_id,
          textAnswer,
        };
        newAnswers.push(newAnswer);
      }
      return newAnswers;
    });
  };

  if (!examLoading) {
    return (
      <>
        <Timer
          duration_min={exam.duration_min}
          autoSubmit={submitExam}
          started_at={attempt.started_at}
        />
        <div className="w-full lg:w-[70%] mx-auto">
          <div className="flex flex-row w-full">
            <main className="flex-grow p-4">
              <div className="px-5 my-13">
                <Card>
                  <CardHeader className="flex flex-row justify-between">
                    <div className="flex flex-col gap-5">
                      <CardTitle>Exam Title: {exam.title}</CardTitle>
                      {exam.duration_min != null && (
                        <CardTitle>Duration: {exam.duration_min} min</CardTitle>
                      )}
                    </div>
                    <div className="flex flex-col gap-5">
                      {exam.grading != "no-grading" && (
                        <CardTitle>Total Marks: {exam.total_marks}</CardTitle>
                      )}
                      <CardTitle>Created By: {exam.created_by}</CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              </div>
              <div className="px-5">
                {exam.questions.map((question, questionNumber) => {
                  const currentAnswer = answers.find(
                    (answer) => answer.question_id === question.id
                  );
                  let answer;
                  if (question.question_type === "single-choice") {
                    answer = currentAnswer
                      ? currentAnswer.answeredOptions[0]
                      : undefined;
                  } else if (question.question_type === "multi-choice") {
                    answer = currentAnswer ? currentAnswer.answeredOptions : [];
                  } else if (question.question_type === "text") {
                    answer = currentAnswer ? currentAnswer.textAnswer : "";
                  }
                  questionNumber = questionNumber + 1;
                  return (
                    <Card key={question.id} className="my-10">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {"Q" + questionNumber + ". " + question.title}
                        </CardTitle>
                        <CardAction>
                          {exam.grading != "no-grading" && (
                            <h3 className="font-bold ">{question.marks}M</h3>
                          )}
                        </CardAction>
                      </CardHeader>
                      <CardContent>
                        {question.question_type === "text" && (
                          <TextareaDebounce
                            debounceFunc={textAnswerChange}
                            questionId={question.id}
                            cols={4}
                            placeholder="Answer in descriptive form"
                          />
                        )}
                        {question.question_type === "multi-choice" && (
                          <MultiChoiceOptions
                            questionId={question.id}
                            checkedOptions={answer}
                            onCheckChange={onCheckChange}
                            options={question.options}
                          />
                        )}
                        {question.question_type === "single-choice" && (
                          <SingleChoiceOptions
                            questionId={question.id}
                            singleChoice={answer}
                            singleChoiceChange={singleChoiceChange}
                            options={question.options}
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="flex flex-row w-full p-5">
                <Button size={"lg"} onClick={submitExam} className="ml-auto">
                  Submit
                </Button>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }
}


  