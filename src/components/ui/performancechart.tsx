//@ts-nocheck
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

export function ChartLineInteractive({ userStats }) {
  const [chartData, setChartData] = useState([]);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    if (userStats?.recent_attempts) {
      // Process recent attempts for the chart
      const processedData = userStats.recent_attempts
        .slice(0, 6) // Last 6 attempts
        .map((attempt, index) => ({
          date: new Date(attempt.submitted_at).toISOString().split("T")[0],
          score: attempt.percentage || 0,
          time: attempt.time_taken_minutes || 0,
          attempt: `Attempt ${index + 1}`,
        }))
        .reverse(); // Show oldest to newest

      setChartData(processedData);

      // Calculate trend (simple comparison of first vs last)
      if (processedData.length >= 2) {
        const firstScore = processedData[0].score;
        const lastScore = processedData[processedData.length - 1].score;
        const trendValue = ((lastScore - firstScore) / firstScore) * 100;
        setTrend(trendValue);
      }
    }
  }, [userStats]);

  const chartConfig = {
    score: {
      label: "Your Score",
      color: "var(--chart-1)",
    },
    time: {
      label: "Time Taken (min)",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  if (!userStats?.recent_attempts || userStats.recent_attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
          <CardDescription>No recent attempts to display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Start taking exams to see your performance history
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance History</CardTitle>
        <CardDescription>
          Last {chartData.length} attempts •{" "}
          {userStats.overall_percentage?.toFixed(1)}% average
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
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
              dataKey="attempt"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <YAxis
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickCount={5}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  nameKey={["score", "time"]}
                  formatter={(value, name) => {
                    if (name === "score") return [`${value}%`, "Score"];
                    if (name === "time") return [`${value} min`, "Time Taken"];
                    return [value, name];
                  }}
                />
              }
            />
            <Line
              dataKey="score"
              type="natural"
              stroke="var(--color-score)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-score)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trend > 0 ? (
            <>
              Trending up by {Math.abs(trend).toFixed(1)}%{" "}
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : trend < 0 ? (
            <>
              Trending down by {Math.abs(trend).toFixed(1)}%{" "}
              <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          ) : (
            "Stable performance"
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Showing your last {chartData.length} exam attempts with scores and
          completion times
        </div>
      </CardFooter>
    </Card>
  );
}
