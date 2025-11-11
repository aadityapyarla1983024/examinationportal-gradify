//@ts-nocheck
import { UserContext } from "@/App";
import PublicExamLeaderBoard from "@/components/publicexamleaderboard";
import { Link } from "react-router-dom";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pen, Pencil, Rocket } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

function PublicExamInfoPage() {
  const { localIp, user, protocol } = useContext(UserContext);
  const { excode } = useParams();
  const [exam, setExam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const res = await axios.post(
          `/api/public-exam/getinfo`,
          { excode },
          { headers: { ["x-auth-token"]: localStorage.getItem("token") } }
        );
        setExam(res.data.exam);
        setLeaderboard(res.data.attempts);
        setLoading(false);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
          console.log(error.response.data.error);
        }
        console.log(error);
      }
    };
    fetchExamInfo();
    exam;
  }, []);

  if (!loading) {
    const {
      domain_name,
      field_name,
      total_marks,
      question_count,
      title,
      exam_desc,
    } = exam;
    let { evaluation, no_of_attempts, scheduled_date } = exam;
    evaluation = (() => {
      if (evaluation === "no") {
        return "No grading";
      } else if (evaluation === "auto") {
        return "Auto";
      } else if (evaluation === "manual") {
        return "Manual";
      }
    })();
    no_of_attempts = (() => {
      if (no_of_attempts === -1) {
        return "Unlimited";
      } else {
        return no_of_attempts;
      }
    })();
    scheduled_date = (() => {
      if (scheduled_date === null || scheduled_date === undefined) {
        return "";
      } else {
        const date = new Date(scheduled_date);
        return `${date.toDateString()} ${date.toLocaleTimeString()}`;
      }
    })();
    const paddedLeaderboard =
      leaderboard.length >= 10
        ? leaderboard
        : [
            ...leaderboard,
            ...Array.from({ length: 10 - leaderboard.length }, (_, i) => ({
              serial: leaderboard.length + i + 1,
              name: "",
              email: "",
              total_attempted: "",
              correct: "",
              incorrect: "",
              awarded_marks: "",
              placeholder: true, // mark as fake row
            })),
          ];
    return (
      <>
        <ToastContainer />
        <div className="p-10 container gap-10 flex flex-col">
          <div className="exam-info w-full">
            <Card className="w-full">
              <CardContent className="w-full">
                <CardTitle className="mb-3 ">
                  <div className="flex flex-row justify-between">
                    <div className="text-xl">{title}</div>
                    <div className="ml-auto my-auto text-lg">
                      {scheduled_date}
                    </div>
                  </div>
                </CardTitle>
                <div className="flex w-full flex-row justify-between">
                  <div className="flex flex-col gap-1">
                    <h3>
                      <b>Domain: </b> {domain_name}
                    </h3>
                    <h3>
                      <b>Max marks: </b>
                      {total_marks}
                    </h3>
                    <h3>
                      <b>Evaluation: </b>
                      {evaluation}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3>
                      <b>Field: </b> {field_name}
                    </h3>
                    <h3>
                      <b>Questions: </b>
                      {question_count}
                    </h3>
                    <h3>
                      <b>Attempts: </b>
                      {no_of_attempts}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-row justify-between">
            <div>
              <Rocket className="inline size-8 text-amber-800 mx-2" />
              {"  "}
              <span className="text-2xl font-medium">
                Attempt this exam right away !
              </span>
            </div>
            <Link to={`/examattempt/${excode}`}>
              <Button>
                <Pencil />
                Attempt
              </Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                See the leaderboad and fuel your competetive spirit{" "}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exam.evaluation != "no" && leaderboard.length != 0 && (
                <PublicExamLeaderBoard data={paddedLeaderboard} />
              )}
              {exam.evaluation != "no" && leaderboard.length === 0 && (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Pencil />
                    </EmptyMedia>
                    <EmptyTitle>No Attempts</EmptyTitle>
                    <EmptyDescription>
                      Give an attempt to appear on the leaderboard
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Link to={`/examattempt/${excode}`}>
                      <Button>Attempt Exam</Button>
                    </Link>
                  </EmptyContent>
                </Empty>
              )}
              {exam.evaluation === "no" && <h3>This is an ungraded </h3>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Exam Description</CardTitle>
              <CardDescription>
                Find some useful information about the exam provided by the
                creator of the exam
              </CardDescription>
            </CardHeader>
            <CardContent>{exam_desc}</CardContent>
            <CardFooter></CardFooter>
          </Card>
        </div>
      </>
    );
  }
}

export default PublicExamInfoPage;
