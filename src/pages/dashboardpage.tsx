import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartLineInteractive } from "@/components/ui/performancechart";
export function DashboardPage() {
  return (
    <>
      <div className="flex flex-col mt-10 w-full p-4 md:p-8 gap-10">
        <div className=" w-full h-fit grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Exams Attempted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">125</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">88%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Exams Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99%</div>
            </CardContent>
          </Card>
        </div>
        <ChartLineInteractive />
      </div>
    </>
  );
}
