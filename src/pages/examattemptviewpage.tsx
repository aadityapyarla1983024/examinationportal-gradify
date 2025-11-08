//@ts-nocheck
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import {
  MultiChoiceOptionsView,
  SingleChoiceOptionsView,
} from "@/components/ui/shadcn-io/radio-group/newquestionoptions";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/App";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function ExamAttemptViewPage() {
  const { user, protocol, localIp } = useContext(UserContext);
  const { excode, exam_attempt_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({});
  const [attempt, setAttempt] = useState({});
  const [answers, setAnswers] = useState({});

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
                    </div>
                  </CardHeader>
                </Card>
              </div>
              <div className="px-5">
                {exam.questions.map((question) => {
                  const currentAnswer = answers.find(
                    (answer) => answer.question_id === question.id
                  );
                  const checkedOptions = currentAnswer
                    ? currentAnswer.answeredOptions
                    : [];
                  const correctOptions = question.correctOptions
                    ? question.correctOptions
                    : [];
                  console.log(currentAnswer);
                  return (
                    <Card key={question.id} className="my-10">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {"Q" + (question.id + 1) + ". " + question.title}
                        </CardTitle>
                        <CardAction>
                          {question.question_type != "text" &&
                            areAnswersCorrect(
                              checkedOptions,
                              correctOptions
                            ) && <Check color="#00c20d" strokeWidth={3} />}
                          {question.question_type != "text" &&
                            !areAnswersCorrect(
                              checkedOptions,
                              correctOptions
                            ) && <X color="red" strokeWidth={3} />}
                          {question.question_type === "text" &&
                            currentAnswer.awarded_marks == null && (
                              <h3 className="font-medium">Pending</h3>
                            )}
                          {question.question_type === "text" &&
                            currentAnswer.awarded_marks != 0 && (
                              <Check color="#00c20d" strokeWidth={3} />
                            )}
                          {question.question_type === "text" &&
                            currentAnswer.awarded_marks === 0 && (
                              <X color="red" strokeWidth={3} />
                            )}
                        </CardAction>
                      </CardHeader>
                      <CardContent>
                        {question.question_type === "text" && (
                          <Textarea
                            cols={4}
                            placeholder="Answer in descriptive form"
                            value={currentAnswer.text_answer}
                          />
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
        </div>
      </>
    );
  }
}
