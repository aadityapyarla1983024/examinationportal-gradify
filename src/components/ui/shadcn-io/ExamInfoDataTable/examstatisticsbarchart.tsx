import { Bar, BarChart, CartesianGrid, ReferenceDot, XAxis, Dot } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
export const description = "A simple area chart";
const chartConfig = {
  frequency: {
    label: "No. of students",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function ExaminationStatisticsBarChart({ chartdata }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Examination Statistics</CardTitle>
        <CardDescription>Showing frequency distribution of all the attempts</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
          <BarChart
            accessibilityLayer
            data={chartdata}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={<ChartTooltipContent className="w-[150px]" nameKey="frequency" />}
            />
            <Bar dataKey="frequency" fill={`var(--color-primary})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter>
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
      </CardFooter> */}
    </Card>
  );
}
