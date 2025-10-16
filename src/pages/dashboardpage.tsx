import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLineInteractive } from "@/components/ui/performancechart";

export function DashboardPage() {
  const stats = {
    total_exams_attempted: 125,
    average_score: 78,
    exams_created: 15,
    highest_score: 98,
  };
  return (
    <>
      <div className="flex flex-col mt-10 w-full p-4 md:p-8 gap-10">
        <div className=" w-full h-fit grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Exams Attempted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_exams_attempted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_score}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Exams Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.exams_created}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.highest_score}%</div>
            </CardContent>
          </Card>
        </div>
        <ChartLineInteractive />
      </div>
    </>
  );
}
