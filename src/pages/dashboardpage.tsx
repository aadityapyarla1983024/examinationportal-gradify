import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { ChartLineInteractive } from "@/components/ui/performancechart";
import { Badge } from "@/components/ui/badge";
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
        <div className="@container/main flex flex-1 flex-col gap-20 lg:w-[90%] mx-auto">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Total Exams Attempted</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.total_exams_attempted}
                </CardTitle>
                <CardAction></CardAction>
              </CardHeader>
            </Card>
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Average Score</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.average_score}
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
                <CardDescription>Exams Created</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.exams_created}
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
                <CardDescription>Highest Score</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.highest_score}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-2xl">
                    {stats.average_score}%
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          </div>
          <ChartLineInteractive />
        </div>
      </div>
    </>
  );
}
