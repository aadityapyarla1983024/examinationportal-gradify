//@ts-nocheck
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

// 🧠 Custom tooltip showing all four metrics
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md shadow-md p-3 text-xs space-y-1">
        <p className="font-semibold text-blue-600">
          {new Date(d.submitted_at).toLocaleString()}
        </p>
        <p>
          <strong>Your Marks:</strong> {d.awarded_marks} / {d.total_marks}
        </p>
        <p>
          <strong>Exam Avg:</strong> {d.exam_avg_marks} / {d.total_marks}
        </p>
        <p>
          <strong>Exam Max:</strong> {d.exam_max_marks} / {d.total_marks}
        </p>
        <p>
          <strong>Exam Min:</strong> {d.exam_min_marks} / {d.total_marks}
        </p>
      </div>
    );
  }
  return null;
};

export function ChartLineInteractive({ userStats }) {
  const [chartData, setChartData] = useState([]);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    if (!userStats?.all_attempts?.length) return;

    const data = userStats.all_attempts
      .filter(
        (a) =>
          a.submitted_at &&
          a.total_marks !== null &&
          a.total_marks !== undefined
      )
      .map((a) => ({
        date: new Date(a.submitted_at).toISOString().split("T")[0],
        submitted_at: a.submitted_at,
        total_marks: Number(a.total_marks) || 0,
        awarded_marks: Number(a.awarded_marks) || 0,
        exam_avg_marks: Number(a.exam_avg_marks) || 0,
        exam_max_marks: Number(a.exam_max_marks) || 0,
        exam_min_marks: Number(a.exam_min_marks) || 0,
      }));

    setChartData(data);

    if (data.length >= 2) {
      const first = data[0].awarded_marks;
      const last = data[data.length - 1].awarded_marks;
      const denom = first === 0 ? 1 : first;
      setTrend(((last - first) / denom) * 100);
    }
  }, [userStats]);

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>No attempts available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Take some exams to visualize your performance.
          </div>
        </CardContent>
      </Card>
    );
  }

  const yMax = Math.max(
    ...chartData.flatMap((d) => [
      d.awarded_marks,
      d.exam_avg_marks,
      d.exam_max_marks,
      d.total_marks,
    ])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
        <CardDescription>
          Your marks vs exam min / avg / max (by date)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* ✅ ResponsiveContainer ensures chart height renders */}
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, Math.ceil(yMax / 10) * 10]} />
              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="awarded_marks"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Your Marks"
              />
              <Line
                type="monotone"
                dataKey="exam_avg_marks"
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 3 }}
                name="Exam Avg"
              />
              <Line
                type="monotone"
                dataKey="exam_max_marks"
                stroke="var(--chart-3)"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3 }}
                name="Exam Max"
              />
              <Line
                type="monotone"
                dataKey="exam_min_marks"
                stroke="var(--chart-4)"
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={{ r: 3 }}
                name="Exam Min"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground">
          Each dot = one attempt • Tooltip shows your marks + exam min/avg/max +
          total
        </div>
      </CardFooter>
    </Card>
  );
}
