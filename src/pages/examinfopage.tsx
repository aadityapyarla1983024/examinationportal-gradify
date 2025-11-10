//@ts-nocheck
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { ExamViewDataTable } from "@/components/ui/shadcn-io/ExamInfoDataTable/datatable";
import ExaminationStatisticsBarChart from "@/components/ui/shadcn-io/ExamInfoDataTable/examstatisticsbarchart";
import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/App";
import axios from "axios";
import { toast } from "react-toastify";
import { Top10QuestionsChart } from "@/components/top10questionchart";

export default function ExamInfoPage() {
  const { excode } = useParams();
  const { user, protocol, localIp } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({});
  const [stats, setStats] = useState({});
  const [attempts, setAttempts] = useState([]);

  function getChartData(attempts, totalMarks, evaluation) {
    // For non-evaluated exams, return empty chart data
    if (evaluation === "no") return [];
    if (!totalMarks || totalMarks <= 0) return [];

    const rangeSize = totalMarks / 10;
    const chartdata = Array.from({ length: 10 }, (_, i) => {
      const lower = Math.round(i * rangeSize);
      const upper = Math.round((i + 1) * rangeSize);
      return { range: `${lower}-${upper}`, frequency: 0 };
    });

    for (const attempt of attempts) {
      const marks = attempt.awarded_marks ?? 0;
      const index = Math.min(9, Math.floor((marks / totalMarks) * 10));
      chartdata[index].frequency++;
    }
    return chartdata;
  }

  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const apiendpoint = `${protocol}://${localIp}:3000/api/examinfo/get-exam-stats`;
        const res = await axios.post(
          apiendpoint,
          { excode },
          { headers: { ["x-auth-token"]: localStorage.getItem("token") } }
        );
        setExam(res.data.exam);
        setStats(res.data.stats);
        setAttempts(res.data.attempts);
        setLoading(false);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.error);
          console.log(error.response.data.message);
        } else {
          toast.error("Unable to fetch exam details");
        }
      }
    };
    fetchExamInfo();
  }, []);

  if (!loading) {
    const { evaluation } = exam;
    const isEvaluated = evaluation !== "no";

    const chartdata = getChartData(attempts, exam.total_marks, evaluation);
    const {
      title,
      domain_name,
      question_count,
      field_name,
      restriction_level,
      created_by,
    } = exam;
    let { exam_type, duration_min, total_marks } = exam;

    // FIX: Only show actual total marks for evaluated exams, otherwise show "Ungraded"
    const displayTotalMarks = isEvaluated
      ? Number(total_marks).toFixed(1)
      : "Ungraded";

    const evaluationText =
      evaluation === "no"
        ? "Not Evaluated"
        : evaluation === "manual"
        ? "Manual"
        : "Auto";

    exam_type = (() => {
      let split = exam_type.split("-", 2);
      split = split.map((w) => w[0].toUpperCase() + w.slice(1));
      return `${split[0]} ${split[1]}`;
    })();

    duration_min =
      duration_min === null || duration_min === undefined
        ? "N/A"
        : `${Number(duration_min).toFixed(1)} min`;

    const displayValue = (value, evaluationType, total) => {
      if (evaluationType === "no") return "Ungraded";
      if (
        evaluationType === "manual" &&
        (value === null || value === undefined)
      )
        return "Pending";
      return `${Number(value).toFixed(1)} / ${Number(total).toFixed(1)}`;
    };

    const displayPercentage = (value, total, evaluationType) => {
      if (evaluationType === "no") return "Ungraded";
      if (
        evaluationType === "manual" &&
        (value === null || value === undefined)
      )
        return "Pending";
      return `${((value / total) * 100).toFixed(1)}%`;
    };

    const displayStatValue = (value, evaluationType) => {
      if (evaluationType === "no") return "Ungraded";
      if (value === null || value === undefined) return "Pending";
      return Number(value).toFixed(1);
    };

    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 lg:w-[90%] mx-auto w-full px-10">
          <div className="flex flex-col gap-4 py-4 md:gap-10 md:py-10">
            <Card>
              <CardHeader className="flex flex-row justify-between">
                <div className="flex flex-col gap-5">
                  <CardTitle>Exam Title: {title}</CardTitle>
                  <CardTitle>Domain: {domain_name}</CardTitle>
                  <CardTitle>Total Questions: {question_count}</CardTitle>
                  <CardTitle>Duration: {duration_min}</CardTitle>
                </div>
                <div className="flex flex-col gap-5">
                  <CardTitle>Created By: {created_by}</CardTitle>
                  <CardTitle>Field: {field_name}</CardTitle>
                  <CardTitle>Evaluation: {evaluationText}</CardTitle>
                  <CardTitle>Exam Type: {exam_type}</CardTitle>
                  <CardTitle>
                    Restriction:{" "}
                    {restriction_level[0].toUpperCase() +
                      restriction_level.slice(1)}
                  </CardTitle>
                  {/* FIX: Use displayTotalMarks instead of total_marks */}
                  <CardTitle>Total Marks: {displayTotalMarks}</CardTitle>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Total Attempts</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {stats.total_attempts}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Highest</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {displayStatValue(stats.max, exam.evaluation)}
                  </CardTitle>
                  {isEvaluated && (
                    <CardAction>
                      <Badge variant="outline" className="text-2xl">
                        {displayPercentage(
                          stats.max,
                          exam.total_marks,
                          exam.evaluation
                        )}
                      </Badge>
                    </CardAction>
                  )}
                </CardHeader>
              </Card>

              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Average</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {displayStatValue(stats.avg, exam.evaluation)}
                  </CardTitle>
                  {isEvaluated && (
                    <CardAction>
                      <Badge variant="outline" className="text-2xl">
                        {displayPercentage(
                          stats.avg,
                          exam.total_marks,
                          exam.evaluation
                        )}
                      </Badge>
                    </CardAction>
                  )}
                </CardHeader>
              </Card>

              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Least Score</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {displayStatValue(stats.min, exam.evaluation)}
                  </CardTitle>
                  {isEvaluated && (
                    <CardAction>
                      <Badge variant="outline" className="text-2xl">
                        {displayPercentage(
                          stats.min,
                          exam.total_marks,
                          exam.evaluation
                        )}
                      </Badge>
                    </CardAction>
                  )}
                </CardHeader>
              </Card>
            </div>

            {isEvaluated && (
              <>
                <div>
                  <ExaminationStatisticsBarChart chartdata={chartdata} />
                </div>
                {/* <div>
                  <Top10QuestionsChart />
                </div> */}
              </>
            )}

            <div>
              <ExamViewDataTable
                exam_code={exam.exam_code}
                evaluation={exam.evaluation}
                attempts={attempts}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
