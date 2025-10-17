import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardAction } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import QuestionOptions, {
  MultiChoiceOptions,
  MultiChoiceOptionsView,
} from "@/components/ui/shadcn-io/radio-group/newquestionoptions";

export default function ExamAttemptViewPage() {
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
  const answers = [
    {
      question_id: 0,
      answeredOptions: [1, 2],
      correctOptions: [1, 3],
    },
  ];

  const areAnswersCorrect = (answered, correct) => {
    if (!Array.isArray(answered) || !Array.isArray(correct)) {
      return false;
    }

    if (answered.length !== correct.length) {
      return false;
    }

    const sortedAnswered = [...answered].sort();
    const sortedCorrect = [...correct].sort();

    return sortedAnswered.every((value, index) => value === sortedCorrect[index]);
  };

  return (
    <>
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
                const correctOptions = currentAnswer ? currentAnswer.correctOptions : [];
                return (
                  <Card key={question.id} className="my-10">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {"Q" + (question.id + 1) + ". " + question.title}
                      </CardTitle>
                      <CardAction>
                        {areAnswersCorrect(checkedOptions, correctOptions) && (
                          <Check color="#00c20d" strokeWidth={3} />
                        )}
                        {!areAnswersCorrect(checkedOptions, correctOptions) && (
                          <X color="red" strokeWidth={3} />
                        )}
                      </CardAction>
                    </CardHeader>
                    <CardContent>
                      {question.questionType === "text" && (
                        <Textarea cols={4} placeholder="Answer in descriptive form" />
                      )}
                      {question.questionType === "multi-choice" && (
                        <MultiChoiceOptionsView
                          checkedOptions={checkedOptions}
                          correctOptions={correctOptions}
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
