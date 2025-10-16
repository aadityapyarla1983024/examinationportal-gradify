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
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import QuestionOptions, {
  MultiChoiceOptions,
} from "@/components/ui/shadcn-io/radio-group/newquestionoptions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ExamAttemptPage() {
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
        questionType: "multi-choice",
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

  useEffect(() => {
    console.log(answers);
  }, [answers]);

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
  return (
    <>
      <div className="fixed right-5 top-5">
        <Card className="p-5">
          <CardTitle>Remaining Time: 12:50 </CardTitle>
        </Card>
      </div>
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
                const checkedOptions = currentAnswer ? currentAnswer.answeredOptions : [];
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
                        <Textarea cols={4} placeholder="Answer in descriptive form" />
                      )}
                      {question.questionType === "multi-choice" && (
                        <MultiChoiceOptions
                          checkedOptions={checkedOptions}
                          onCheckChange={onCheckChange}
                          questionId={question.id}
                          options={question.options}
                        />
                      )}
                      {question.questionType === "single-choice" && (
                        <QuestionOptions options={question.options} />
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

export function ExamAttemptSidebar() {
  return (
    <Sidebar side="right" className="">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Questions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Card>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-x-2 gap-y-2">
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">1</div>
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">2</div>
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">3</div>
                      <div className="h-10 w-10 bg-amber-200  py-2 px-4">4</div>
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">5</div>
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">6</div>
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">7</div>
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">8</div>
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">9</div>
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">10</div>
                      <div className="h-10 w-10 bg-amber-200 py-2 px-4">11</div>
                    </div>
                  </CardContent>
                </Card>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
