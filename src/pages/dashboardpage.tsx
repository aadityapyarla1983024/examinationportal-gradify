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
    const fetchStats = async () => {
      try {
        const api = `/api/stats/get-user-overall-statistics`;
        const res = await axios.post(
          api,
          { user_id: JSON.parse(localStorage.getItem("user")).id },
          { headers: { ["x-auth-token"]: localStorage.getItem("token") } }
        );
        setUserStats(res.data.data);
        console.log("User stats:", res.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [protocol, localIp]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Loading dashboard...
      </div>
    );

  if (!userStats)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        No statistics available yet.
      </div>
    );

  const cards = {
    highest_percent: userStats.highest_score_percent || 0,
    average_percent: userStats.average_score_percent || 0,
    total_created: userStats.total_exams_created || 0,
    total_attempts: userStats.total_attempts_made || 0,
  };

  return (
    <div className="flex flex-col mt-10 w-full p-4 md:p-8 gap-10">
      <div className="@container/main flex flex-1 flex-col w-full gap-20 lg:w-[90%] mx-auto">
        {/* TOP 4 CARDS */}
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Highest Score</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {cards.highest_percent.toFixed(1)}%
              </CardTitle>
              <CardAction>
                <Badge variant="outline">Best Attempt</Badge>
              </CardAction>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {cards.average_percent.toFixed(1)}%
              </CardTitle>
              <CardAction>
                <Badge variant="outline">Across Attempts</Badge>
              </CardAction>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Exams Created</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {cards.total_created}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">Your Exams</Badge>
              </CardAction>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Attempts Made</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {cards.total_attempts}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">All Attempts</Badge>
              </CardAction>
            </CardHeader>
          </Card>
        </div>

        {/* PERFORMANCE CHART */}
        <ChartLineInteractive userStats={userStats} />
      </div>
    </div>
  );
}
