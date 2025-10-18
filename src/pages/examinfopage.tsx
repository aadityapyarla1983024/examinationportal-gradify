//@ts-nocheck
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { ExamViewDataTable } from "@/components/ui/shadcn-io/ExamInfoDataTable/datatable";
import ExaminationStatisticsBarChart from "@/components/ui/shadcn-io/ExamInfoDataTable/examstatisticsbarchart";
export default function ExamInfoPage() {
  const stats = {
    total_exams_attempted: 125,
    average_score: 78,
    exams_created: 15,
    highest_score: 98,
    average_marks: 23,
    highest_marks: 40,
    least_marks: 10,
    least_score: 20,
  };
  const exam = {
    exam_code: 12421,
    exam_title: "DSA Lab Exam UG 2024-2025",
    exam_duration: 120,
    total_questions: 50,
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
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 lg:w-[90%] mx-auto">
        <div className="flex flex-col gap-4 py-4 md:gap-10 md:py-10">
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div className="flex flex-col gap-5">
                <CardTitle>Exam Title: {exam.exam_title}</CardTitle>
                <CardTitle>Duration: {exam.exam_duration} min</CardTitle>
                <CardTitle>Total Questions: {exam.total_questions} </CardTitle>
              </div>
              <div className="flex flex-col gap-5">
                <CardTitle>Total Marks: {exam.total_marks}</CardTitle>
                <CardTitle>Created By: {exam.created_by}</CardTitle>
              </div>
            </CardHeader>
          </Card>
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Total Attempts</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.total_exams_attempted}
                </CardTitle>
                <CardAction></CardAction>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Highest</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.highest_marks}/{exam.total_marks}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-2xl">
                    {stats.highest_score}%
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Average</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.average_marks}/{exam.total_marks}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-2xl">
                    {stats.average_score}%
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Least Score</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.least_marks}/{exam.total_marks}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-2xl">
                    {stats.least_score}%
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          </div>
          <div>
            <ExaminationStatisticsBarChart chartdata={chartdata} />
          </div>
          <div>
            <ExamViewDataTable attempts={attempts} />
          </div>
        </div>
      </div>
    </div>
  );
}
export const chartdata = [
  { range: "10-20", frequency: 10 },
  { range: "20-30", frequency: 23 },
  { range: "30-40", frequency: 9 },
  { range: "40-50", frequency: 20 },
  { range: "50-60", frequency: 11 },
  { range: "60-70", frequency: 13 },
  { range: "70-80", frequency: 15 },
  { range: "80-90", frequency: 30 },
  { range: "90-100", frequency: 40 },
];

export const attempts = [
  {
    roll: "24BCS003",
    name: "Aaditya Pyarla",
    marks: 0,
    score: 90,
    total_questions_attempted: 50,
    total_questions_correct: 30,
    total_questions_incorrect: 20,
  },
  {
    roll: "24BCS004",
    name: "Aarush Pyarla",
    marks: 234,
    score: 50,
    total_questions_attempted: 30,
    total_questions_correct: 20,
    total_questions_incorrect: 10,
  },
];
