//@ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { CopyIcon } from "lucide-react";
export default function MyExamsPage() {
  const examsCreated = [
    {
      title: "DSA lab exam UG2025 Batch",
      created_at: "2025-10-12 17:50:21",
      scheduled_at: "2025-10-15 09:00:00",
      exam_code: 12312,
      total: 300,
      duration: 90,
      highest: 299,
      least: 50,
      average: 255,
    },
    {
      title: "JAVA lab exam UG2025 Batch",
      created_at: "2025-12-12 17:50:21",
      scheduled_at: "2025-20-15 09:00:00",
      exam_code: 12112,
      total: 300,
      duration: 70,
      highest: 289,
      least: 70,
      average: 295,
    },
  ];
  const examAttempted = [
    {
      title: "DSA lab exam UG2025 Batch",
      submitted_at: "2025-10-12 17:50:21",
      scheduled_at: "2025-10-15 09:00:00",
      exam_code: 12312,
      total: 300,
      marks: 255,
      score: 98,
      duration: 90,
      highest: 299,
      average: 255,
      attempt_no: 2,
    },
    {
      title: "JAVA lab exam UG2025 Batch",
      submitted_at: "2025-12-12 17:50:21",
      scheduled_at: "2025-20-15 09:00:00",
      exam_code: 12112,
      total: 300,
      marks: 255,
      score: 89,
      duration: 70,
      highest: 289,
      average: 295,
      attempt_no: 5,
    },
  ];
  return (
    <>
      <Tabs defaultValue="exams-created" className="w-full">
        <TabsList className="grid w-[90%] grid-cols-2 mx-auto mt-8 sm:w-[75%] md:w-[60%] lg:w-[50%]">
          <TabsTrigger value="exams-created">Exams Created</TabsTrigger>
          <TabsTrigger value="exams-attempted">Exams Attempted</TabsTrigger>
        </TabsList>

        <TabsContent value="exams-created">
          <div className="p-4 md:p-8 h-full">
            <ScrollArea className="h-full w-full rounded-md border p-5">
              {examsCreated.length != 0 &&
                examsCreated.map((exam) => {
                  return (
                    <Card className="my-5" key={exam.exam_code}>
                      <CardHeader>
                        <CardTitle>{exam.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-15">
                          <div className="flex flex-col gap-2 lg:w-max">
                            <h2>Schedueld On</h2>
                            <h1>{exam.scheduled_at}</h1>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h2>Duration</h2>
                            <h1>{exam.duration} Min</h1>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h2>Highest Marks</h2>
                            <h1>
                              {exam.highest} / {exam.total}
                            </h1>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h2>Average</h2>
                            <h1>
                              {exam.average} / {exam.total}
                            </h1>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h2>Least Marks</h2>
                            <h1>
                              {exam.least} / {exam.total}
                            </h1>
                          </div>
                          <div className="flex flex-col gap-2 ml-auto">
                            <Link to={"/dashboard/examinfo"}>
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
              {examsCreated.length === 0 && <h1>No exams created yet</h1>}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="exams-attempted">
          <div className="p-4 md:p-8 h-full">
            <ScrollArea className="w-full h-full rounded-md border p-5">
              {examAttempted.length !== 0 &&
                examAttempted.map((exam) => {
                  return (
                    <Card key={exam.exam_code} className="my-5">
                      <CardHeader>
                        <CardTitle>{exam.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-15">
                          <div className="flex flex-col gap-2 lg:w-max">
                            <h2>Submitted At</h2>
                            <h1>{exam.submitted_at}</h1>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h2>Marks</h2>
                            <h1>
                              {exam.marks} / {exam.total}
                            </h1>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h2>Score</h2>
                            <h1>{exam.score}%</h1>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h2>Highest Marks</h2>
                            <h1>
                              {exam.highest} / {exam.total}
                            </h1>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h2>Average</h2>
                            <h1>
                              {exam.average} / {exam.total}
                            </h1>
                          </div>
                          <div className="flex flex-col gap-2 lg:ml-auto">
                            <Link to={"/dashboard/viewattempt"}>
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
              {examAttempted.length === 0 && <h1 className="p-4">No Exams Attempted</h1>}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
