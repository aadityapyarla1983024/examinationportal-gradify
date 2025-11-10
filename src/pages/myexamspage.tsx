//@ts-nocheck
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/App";
import axios from "axios";
import { toast } from "react-toastify";
import { EmptyPublicExams } from "./publicexampage.tsx";

export default function MyExamsPage() {
  const { protocol, user, localIp } = useContext(UserContext);
  const [examsCreated, setExamsCreated] = useState([]);
  const [examsAttempted, setExamsAttempted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getExams = `${protocol}://${localIp}:3000/api/myexams/short/get-exams`;
    const fetchUserExamStats = async () => {
      try {
        const res = await axios.post(
          getExams,
          {},
          {
            headers: {
              ["x-auth-token"]: localStorage.getItem("token"),
            },
          }
        );
        setExamsCreated(res.data.created);
        setExamsAttempted(res.data.attempts);
        console.log(res.data);
        setLoading(false);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
          console.log(error.response.data.error);
        } else {
          toast.error("Something went wrong while fetching your exam history");
        }
      }
    };
    fetchUserExamStats();
  }, []);

  return (
    <>
      <Tabs
        defaultValue="exams-created"
        className="w-full flex flex-col h-screen overflow-hidden"
      >
        <TabsList className="grid w-[90%] grid-cols-2 mx-auto mt-8 sm:w-[75%] md:w-[60%] lg:w-[50%]">
          <TabsTrigger value="exams-created">Exams Created</TabsTrigger>
          <TabsTrigger value="exams-attempted">Exams Attempted</TabsTrigger>
        </TabsList>

        {/* ======================== EXAMS CREATED ======================== */}
        <TabsContent value="exams-created" className="flex flex-col flex-1 ">
          <div className="p-4 md:p-8 flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="w-full h-[85vh] rounded-md border p-5">
              {examsCreated.length != 0 &&
                !loading &&
                examsCreated.map((exam) => {
                  return (
                    <Card className="my-5" key={exam.exam_code}>
                      <CardHeader>
                        <CardTitle>{exam.title}</CardTitle>
                        <CardDescription>
                          Attempts :{" "}
                          {(() => {
                            if (exam.no_of_attempts === -1) {
                              return "Unlimited";
                            }
                            return `${exam.no_of_attempts}`;
                          })()}
                          {" | "}
                          {(() => {
                            let split = exam.exam_type.split("-", 2);
                            split = split.map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            );
                            return `${split[0]} ${split[1]}`;
                          })()}
                          {" | "}
                          {exam.field_name}
                          {" | "}
                          {exam.domain_name}
                          {" | "}
                          {exam.evaluation[0].toUpperCase() +
                            exam.evaluation.slice(1)}{" "}
                          {"Evaluation"}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-15">
                          <div className="flex flex-col gap-2">
                            <h2>Duration</h2>
                            <h1>
                              {exam.duration_min === null
                                ? "N/A"
                                : `${Number(exam.duration_min).toFixed(1)} min`}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2">
                            <h2>Highest Marks</h2>
                            <h1>
                              {exam.total_marks === 0
                                ? `Ungraded`
                                : exam.max
                                ? `${Number(exam.max).toFixed(1)} / ${Number(
                                    exam.total_marks
                                  ).toFixed(1)}`
                                : "N/A"}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2">
                            <h2>Average</h2>
                            <h1>
                              {exam.total_marks === 0
                                ? `Ungraded`
                                : exam.avg
                                ? `${Number(exam.avg).toFixed(1)} / ${Number(
                                    exam.total_marks
                                  ).toFixed(1)}`
                                : "N/A"}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2">
                            <h2>Least Marks</h2>
                            <h1>
                              {exam.total_marks === 0
                                ? `Ungraded`
                                : exam.min
                                ? `${Number(exam.min).toFixed(1)} / ${Number(
                                    exam.total_marks
                                  ).toFixed(1)}`
                                : "N/A"}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2 lg:w-max">
                            <h2>Scheduled On</h2>
                            <h1>
                              {exam.scheduled_on
                                ? (() => {
                                    const scheduled_on = new Date(
                                      exam.scheduled_on
                                    );
                                    return `${scheduled_on.toLocaleDateString()} ${scheduled_on.toLocaleTimeString()}`;
                                  })()
                                : "N/A"}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2 ml-auto">
                            <Link to={`/dashboard/examinfo/${exam.exam_code}`}>
                              <Button className="w-full" variant={"outline"}>
                                View
                              </Button>
                            </Link>
                            <div className="flex flex-row align-middle justify-center gap-2">
                              <CopyButton content={exam.exam_code} />
                              <span className="p-1">Exam Code</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              {examsCreated.length === 0 && (
                <div className="mx-auto my-auto h-full">
                  <EmptyPublicExams />
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        {/* ======================== EXAMS ATTEMPTED ======================== */}
        <TabsContent
          value="exams-attempted"
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex flex-col flex-1 overflow-hidden p-4 md:p-8">
            <ScrollArea className="h-[85vh] w-full rounded-md border p-5">
              {examsAttempted.length !== 0 &&
                !loading &&
                examsAttempted.map((exam) => {
                  return (
                    <Card key={exam.exam_code} className="my-5">
                      <CardHeader>
                        <CardTitle className="w-fit">{exam.title}</CardTitle>
                        <CardDescription>
                          {`Attempt No: ${exam.attempt_number}`}
                          {" | "}
                          {(() => {
                            let split = exam.exam_type.split("-", 2);
                            split = split.map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            );
                            return `${split[0]} ${split[1]}`;
                          })()}
                          {" | "}
                          {exam.field_name}
                          {" | "}
                          {exam.domain_name}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-auto">
                          <div className="flex flex-col gap-2">
                            <h2>Duration</h2>
                            <h1>
                              {exam.duration_min === null
                                ? "N/A"
                                : `${Number(exam.duration_min).toFixed(1)} min`}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2">
                            <h2>Marks</h2>
                            <h1>
                              {exam.evaluation === "no"
                                ? `Ungraded`
                                : exam.evaluation === "manual" &&
                                  exam.awarded_marks === null
                                ? "Pending"
                                : `${Number(exam.awarded_marks).toFixed(
                                    1
                                  )} / ${Number(exam.total_marks).toFixed(1)}`}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2">
                            <h2>Score</h2>
                            <h1>
                              {exam.evaluation === "no"
                                ? `Ungraded`
                                : exam.evaluation === "manual" &&
                                  exam.awarded_marks === null
                                ? "Pending"
                                : `${(
                                    (exam.awarded_marks / exam.total_marks) *
                                    100
                                  ).toFixed(1)}%`}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2">
                            <h2>Highest Marks</h2>
                            <h1>
                              {exam.evaluation === "no"
                                ? `Ungraded`
                                : exam.evaluation === "manual" &&
                                  exam.awarded_marks === null
                                ? "Pending"
                                : `${Number(exam.max).toFixed(1)} / ${Number(
                                    exam.total_marks
                                  ).toFixed(1)}`}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2">
                            <h2>Average</h2>
                            <h1>
                              {exam.evaluation === "no"
                                ? `Ungraded`
                                : exam.evaluation === "manual" &&
                                  exam.awarded_marks === null
                                ? "Pending"
                                : `${Number(exam.avg).toFixed(1)} / ${Number(
                                    exam.total_marks
                                  ).toFixed(1)}`}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2 lg:w-max">
                            <h2>Submitted At</h2>
                            <h1>
                              {(() => {
                                const submitted_at = new Date(
                                  exam.submitted_at
                                );
                                return `${submitted_at.toLocaleDateString()} ${submitted_at.toLocaleTimeString()}`;
                              })()}
                            </h1>
                          </div>

                          <div className="flex flex-col gap-2 lg:ml-auto">
                            <Link
                              to={`/dashboard/viewattempt/${exam.exam_code}/${exam.id}`}
                            >
                              <Button className="w-full" variant={"outline"}>
                                View
                              </Button>
                            </Link>
                            <div className="flex flex-row align-middle justify-center gap-2">
                              <CopyButton content={exam.exam_code} />
                              <span className="p-1">Exam Code</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              {examsAttempted.length === 0 && (
                <div className="mx-auto my-auto h-full">
                  <NoAttemptsYet />
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

import { Pencil } from "lucide-react";
import { ArrowUpRightIcon } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function NoAttemptsYet() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Pencil />
        </EmptyMedia>
        <EmptyTitle>No attempts Yet</EmptyTitle>
        <EmptyDescription>
          Get started by attempting your first exam.
        Have an exam code ?
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Link to={"/dashboard/enter-exam"}>
          
          <Button>Attempt exam</Button>
          </Link>
        </div>
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <Link to={"/dashboard/create-exam"}>
          Create an exam <ArrowUpRightIcon />
        </Link>
      </Button>
    </Empty>
  );
}
