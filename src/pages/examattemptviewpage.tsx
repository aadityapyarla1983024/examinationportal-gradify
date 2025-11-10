//@ts-nocheck
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import {
  MultiChoiceOptionsView,
  SingleChoiceOptionsView,
} from "@/components/ui/shadcn-io/radio-group/newquestionoptions";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/App";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

export default function ExamAttemptViewPage() {
  const { user, protocol, localIp } = useContext(UserContext);
  const { excode, exam_attempt_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({});
  const [attempt, setAttempt] = useState({});
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempt = async () => {
      const apiendpoint = `${protocol}://${localIp}:3000/api/attempt/view-attempt`;
      try {
        const res = await axios.post(
          apiendpoint,
          { excode, exam_attempt_id },
          {
            headers: {
              ["x-auth-token"]: localStorage.getItem("token"),
            },
          }
        );
        setAnswers(res.data.answers);
        setExam(res.data.exam);
        setAttempt(res.data.attempt);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
          toast.error(error.response.data.error);
        } else {
          console.log(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, []);

  const areAnswersCorrect = (answered, correct) => {
    if (!Array.isArray(answered) || !Array.isArray(correct)) {
      return false;
    }

    if (answered.length !== correct.length) {
      return false;
    }

    const sortedAnswered = [...answered].sort();
    const sortedCorrect = [...correct].sort();

    return sortedAnswered.every(
      (value, index) => value === sortedCorrect[index]
    );
  };

  // Helper function to determine what to display for text questions with no evaluation
  const getTextQuestionStatus = (question, currentAnswer) => {
    // If evaluation type is "no evaluation", always show as submitted
    if (exam.evaluation_type === "no") {
      return {
        status: "submitted",
        icon: null, // No icon for no evaluation
        text: "Submitted",
        className: "text-blue-500",
      };
    }

    // For other evaluation types, use the existing logic
    if (currentAnswer.awarded_marks == null) {
      return {
        status: "pending",
        icon: <h3 className="font-medium">Pending</h3>,
        text: "Pending",
        className: "text-yellow-500",
      };
    }
    if (currentAnswer.awarded_marks != 0) {
      return {
        status: "correct",
        icon: <Check color="#00c20d" strokeWidth={3} />,
        text: "Correct",
        className: "text-green-500",
      };
    }
    return {
      status: "incorrect",
      icon: <X color="red" strokeWidth={3} />,
      text: "Incorrect",
      className: "text-red-500",
    };
  };

  if (!loading) {
    return (
      <>
        <div className="w-full lg:w-[70%] mx-auto">
          <div className="flex flex-row w-full">
            <main className="flex-grow p-4">
              <div className="px-5 my-13">
                <Card>
                  <CardHeader className="flex flex-row justify-between">
                    <div className="flex flex-col gap-5">
                      <CardTitle>Exam Title: {exam.title}</CardTitle>
                      <CardTitle>Max Marks: {exam.total_marks}</CardTitle>
                      <CardTitle>
                        Total Correct: {attempt.total_correct}
                      </CardTitle>
                    </div>
                    <div className="flex flex-col gap-5">
                      <CardTitle>Duration: {exam.duration_min} min</CardTitle>
                      <CardTitle>
                        Total Questions: {exam.question_count}
                      </CardTitle>
                      <CardTitle>
                        Total Incorrect: {attempt.total_incorrect}
                      </CardTitle>
                      {/* Show evaluation type */}
                      <CardTitle>
                        Evaluation Type: {exam.evaluation_type || "auto"}
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              </div>
              <div className="px-5">
                {exam.questions?.map((question) => {
                  const currentAnswer = answers.find(
                    (answer) => answer.question_id === question.id
                  );
                  const checkedOptions = currentAnswer
                    ? currentAnswer.answeredOptions
                    : [];
                  const correctOptions = question.correctOptions
                    ? question.correctOptions
                    : [];

                  const textQuestionStatus = getTextQuestionStatus(
                    question,
                    currentAnswer
                  );

                  return (
                    <Card key={question.id} className="my-10">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {"Q" + (question.id + 1) + ". " + question.title}
                        </CardTitle>
                        <CardAction>
                          {/* For multiple choice and single choice questions */}
                          {question.question_type !== "text" &&
                            areAnswersCorrect(
                              checkedOptions,
                              correctOptions
                            ) && <Check color="#00c20d" strokeWidth={3} />}
                          {question.question_type !== "text" &&
                            !areAnswersCorrect(
                              checkedOptions,
                              correctOptions
                            ) && <X color="red" strokeWidth={3} />}

                          {/* For text questions */}
                          {question.question_type === "text" && (
                            <div
                              className={`flex items-center gap-2 ${textQuestionStatus.className}`}
                            >
                              {textQuestionStatus.icon}
                              <span className="font-medium">
                                {textQuestionStatus.text}
                              </span>
                            </div>
                          )}
                        </CardAction>
                      </CardHeader>
                      <CardContent>
                        {question.question_type === "text" && (
                          <div>
                            <Textarea
                              cols={4}
                              placeholder="Answer in descriptive form"
                              value={currentAnswer?.text_answer || ""}
                              readOnly
                              className="mb-3"
                            />
                            {/* Show additional info for no evaluation type */}
                            {exam.evaluation_type === "no evaluation" && (
                              <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                                <p>
                                  This question is not automatically evaluated.
                                </p>
                                <p>
                                  Your response has been submitted for review.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        {question.question_type === "multi-choice" && (
                          <MultiChoiceOptionsView
                            checkedOptions={checkedOptions}
                            correctOptions={correctOptions}
                            questionId={question.id}
                            options={question.options}
                          />
                        )}
                        {question.question_type === "single-choice" && (
                          <SingleChoiceOptionsView
                            checkedOptions={checkedOptions}
                            correctOptions={correctOptions}
                            questionId={question.id}
                            options={question.options}
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </main>
          </div>
          <div className="w-full flex flex-row justify-end align-bottom px-10">
            <Button
              onClick={() => {
                navigate(-1);
              }}
            >
              <ArrowLeft />
              Go Back
            </Button>
          </div>
        </div>
      </>
    );
  }
}
