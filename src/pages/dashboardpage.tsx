import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { ChartLineInteractive } from "@/components/ui/performancechart";
import { Badge } from "@/components/ui/badge";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { UserContext } from "@/App";

export function DashboardPage() {
  const { localIp, protocol } = useContext(UserContext);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserExamStatistics = async () => {
      try {
        const apiendpoint = `${protocol}://${localIp}:3000/api/stats/get-user-overall-statistics`;
        const res = await axios.post(
          apiendpoint,
          { user_id: JSON.parse(localStorage.getItem("user")).id },
          {
            headers: {
              ["x-auth-token"]: localStorage.getItem("token"),
            },
          }
        );
        console.log("User stats:", res.data);
        setUserStats(res.data.data);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
          console.log(error.response.data.error);
        } else {
          console.log(error);
          toast.error("Failed to load statistics");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserExamStatistics();
  }, []);

  // Calculate derived statistics
  const stats = userStats
    ? {
        total_exams_attempted: userStats.total_exams_attempted || 0,
        average_score: userStats.overall_percentage || 0,
        exams_created: 0, // You'll need to fetch this separately
        highest_score: userStats.best_marks || 0,
        total_attempts: userStats.total_attempts || 0,
        passed_exams: userStats.passed_exams || 0,
        success_rate:
          userStats.total_attempts > 0
            ? Math.round(
                (userStats.passed_exams / userStats.total_attempts) * 100
              )
            : 0,
        total_time_spent:
          Math.round(userStats.total_time_spent_minutes / 60) || 0, // Convert to hours
      }
    : null;

  if (loading) {
    return (
      <div className="flex flex-col mt-10 w-full p-4 md:p-8 gap-10">
        <div className="@container/main flex flex-1 flex-col w-full gap-20 lg:w-[90%] mx-auto">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="@container/card animate-pulse">
                <CardHeader>
                  <CardDescription className="h-4 bg-gray-200 rounded w-1/2"></CardDescription>
                  <CardTitle className="h-8 bg-gray-200 rounded w-3/4 mt-2"></CardTitle>
                  <CardAction>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </CardAction>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col mt-10 w-full p-4 md:p-8 gap-10">
        <div className="@container/main flex flex-1 flex-col w-full gap-20 lg:w-[90%] mx-auto">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Total Exams Attempted</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.total_exams_attempted}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-sm">
                    {stats.total_attempts} attempts
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Average Score</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.average_score.toFixed(1)}%
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-sm">
                    Overall
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Success Rate</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.success_rate}%
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-sm">
                    {stats.passed_exams} passed
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Highest Score</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats.highest_score.toFixed(1)}%
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-sm">
                    Personal Best
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          </div>

          <ChartLineInteractive userStats={userStats} />
        </div>
      </div>
    </>
  );
}
