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
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Trending up this month
                  <TrendingUp />
                </div>
              </CardFooter>
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
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Down 20% this period <TrendingDown className="size-4" />
                </div>
              </CardFooter>
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
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Strong user retention <TrendingUp className="size-4" />
                </div>
              </CardFooter>
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
              <CardFooter className="text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Steady performance increase <TrendingUp className="size-4" />
                </div>
              </CardFooter>
            </Card>
          </div>
          <div>
            <ChartAreaDefault />
          </div>
          <div>
            <DataTableDemo attempts={attempts} />
          </div>
        </div>
      </div>
    </div>
  );
}

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

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { DataTableDemo } from "@/components/ui/shadcn-io/ExamInfoDataTable/datatable";
export const description = "A simple area chart";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaDefault() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart</CardTitle>
        <CardDescription>Showing total visitors for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
