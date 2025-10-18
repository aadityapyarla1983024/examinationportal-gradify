//@ts-nocheck
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea, TextareaDebounce } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import {
  MultiChoiceOptions,
  SingleChoiceOptions,
} from "@/components/ui/shadcn-io/radio-group/newquestionoptions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const Timer = ({ exam_duration }) => {
  const [timer, setTimer] = useState(exam_duration * 60);
  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  }, []);

  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = Math.floor(timer % 60);
  return (
    <div className="fixed right-5 top-5">
      <Card className="p-5">
        <CardTitle>
          Remaining Time:
          {`${String(hours).padStart(2, 0)}:${String(minutes).padStart(2, 0)}:${String(
            seconds
          ).padStart(2, 0)}`}
        </CardTitle>
      </Card>
    </div>
  );
};

export default function ExamAttemptPage() {
  useEffect(() => {});
  const exam = {
    exam_code: 12421,
    exam_title: "DSA Lab Exam UG 2024-2025",
    exam_duration: 120,
    total_marks: 50,
    created_by: "Aaditya Pyarla",
    questions: [
      {
        id: 0,
        title: "dswqdqwd",
        questionType: "text",
        options: [
          {
            id: 0,
            title: "Ferfverv",
          },
          {
            id: 1,
            title: "Ferfvdwederv",
          },
          {
            id: 2,
            title: "Ferfvedewderv",
          },
          {
            id: 3,
            title: "Ferfveqawaddfrv",
          },
        ],
      },
    ],
  };
  const [answers, setAnswers] = useState([]);

  const onCheckChange = (isChecked, optionId, questionId) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const index = newAnswers.findIndex((answer) => answer.question_id == questionId);
      if (index != -1) {
        const existingAnswer = newAnswers[index];
        let updatedOptions = existingAnswer.answeredOptions;

        if (isChecked) {
          updatedOptions = [...updatedOptions, optionId];
        } else {
          updatedOptions = existingAnswer.answeredOptions.filter((option) => option != optionId);
        }
        newAnswers[index] = { ...existingAnswer, answeredOptions: updatedOptions };
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
      const index = newAnswers.findIndex((answer) => answer.question_id === question_id);
      if (index != -1) {
        const existingAnswer = newAnswers[index];
        const updatedOptions = [optionId];
        newAnswers[index] = { ...existingAnswer, answeredOptions: updatedOptions };
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

  useEffect(() => console.log(answers), [answers]);

  const textAnswerChange = (textAnswer, question_id) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const index = newAnswers.findIndex((answer) => answer.question_id === question_id);
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

  return (
    <>
      <Timer exam_duration={exam.exam_duration} />
      <div className="w-full lg:w-[70%] mx-auto">
        <div className="flex flex-row w-full">
          <main className="flex-grow p-4">
            <div className="px-5 my-13">
              <Card>
                <CardHeader className="flex flex-row justify-between">
                  <div className="flex flex-col gap-5">
                    <CardTitle>Exam Title: {exam.exam_title}</CardTitle>
                    <CardTitle>Duration: {exam.exam_duration} min</CardTitle>
                  </div>
                  <div className="flex flex-col gap-5">
                    <CardTitle>Total Marks: {exam.total_marks}</CardTitle>
                    <CardTitle>Created By: {exam.created_by}</CardTitle>
                  </div>
                </CardHeader>
              </Card>
            </div>
            <div className="px-5">
              {exam.questions.map((question) => {
                const currentAnswer = answers.find((answer) => answer.question_id === question.id);
                let answer;
                if (question.questionType === "single-choice") {
                  answer = currentAnswer ? currentAnswer.answeredOptions[0] : undefined;
                } else if (question.questionType === "multi-choice") {
                  answer = currentAnswer ? currentAnswer.answeredOptions : [];
                } else if (question.questionType === "text") {
                  answer = currentAnswer ? currentAnswer.textAnswer : "";
                }
                return (
                  <Card key={question.id} className="my-10">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {"Q" + (question.id + 1) + ". " + question.title}
                      </CardTitle>
                      <CardAction>
                        <Check color="#00c20d" strokeWidth={3} />
                      </CardAction>
                    </CardHeader>
                    <CardContent>
                      {question.questionType === "text" && (
                        <TextareaDebounce
                          debounceFunc={textAnswerChange}
                          questionId={question.id}
                          cols={4}
                          placeholder="Answer in descriptive form"
                        />
                      )}
                      {question.questionType === "multi-choice" && (
                        <MultiChoiceOptions
                          questionId={question.id}
                          checkedOptions={answer}
                          onCheckChange={onCheckChange}
                          options={question.options}
                        />
                      )}
                      {question.questionType === "single-choice" && (
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
              <Button size={"lg"} className="ml-auto">
                Submit
              </Button>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
