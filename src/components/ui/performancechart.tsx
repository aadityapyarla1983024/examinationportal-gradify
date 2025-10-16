//@ts-nocheck
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function ChartLineInteractive() {
  const chartData = [
    { date: "2024-06-22", score: 186, average: 24 },
    { date: "2024-06-23", score: 305, average: 77 },
    { date: "2024-06-26", score: 237, average: 16 },
    { date: "2024-06-06", score: 73, average: 70 },
    { date: "2024-05-23", score: 209, average: 186 },
    { date: "2024-04-19", score: 214, average: 76 },
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartConfig = {
    score: {
      label: "Score",
      color: "var(--chart-1)",
    },
    average: {
      label: "Average",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Performance History</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis tickLine={true} axisLine={true} tickMargin={8} tickCount={3} />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={["Score", "Average"]}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey="score"
              type="natural"
              stroke="var(--color-score)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="average"
              type="natural"
              stroke="var(--color-average)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
