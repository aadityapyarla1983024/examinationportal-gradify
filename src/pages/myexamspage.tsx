import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
export const description = "An interactive line chart";
export default function MyExamsPage() {
  return (
    <>
      <Tabs defaultValue="exams-created" className="w-full">
        <TabsList className="grid w-[90%] grid-cols-2 mx-auto mt-8 sm:w-[75%] md:w-[60%] lg:w-[50%]">
          <TabsTrigger value="exams-created">Exams Created</TabsTrigger>
          <TabsTrigger value="exams-attempted">Exams Attempted</TabsTrigger>
        </TabsList>

        <TabsContent value="exams-created">
          <div className="p-4 md:p-8">
            <ScrollArea className="h-72 w-full rounded-md border p-5">
              <h1 className="p-4">Exams you have created will appear here.</h1>
              <Card>
                <CardHeader>
                  <CardTitle>DSA lab exam UG2025 Batch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-row gap-20">
                    <div className="flex flex-col gap-2">
                      <h2>Submitted At</h2>
                      <h1>24th July, 2025 10:53 AM</h1>
                    </div>
                    {/* <div className="flex flex-col gap-2">
                      <h2>Marks</h2>
                      <h1>256 / 300</h1>
                    </div> */}
                    {/* <div className="flex flex-col gap-2">
                      <h2>Score</h2>
                      <h1>88%</h1>
                    </div> */}
                    <div className="flex flex-col gap-2">
                      <h2>Highest Marks</h2>
                      <h1>299 / 300</h1>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2>Average</h2>
                      <h1>255 / 300</h1>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2>Least Marks</h2>
                      <h1>50 / 300</h1>
                    </div>
                    <div className="flex flex-col gap-2 ml-auto">
                      <Button variant={"outline"}>View</Button>
                      <Button>
                        <Copy /> Exam Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="exams-attempted">
          <div className="p-4 md:p-8">
            <ScrollArea className="w-full h-72 rounded-md border p-5">
              <h1 className="p-4">No Exams Attempted</h1>
              <Card>
                <CardHeader>
                  <CardTitle>DSA lab exam UG2025 Batch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-row gap-20">
                    <div className="flex flex-col gap-2">
                      <h2>Submitted At</h2>
                      <h1>24th July, 2025 10:53 AM</h1>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2>Marks</h2>
                      <h1>256 / 300</h1>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2>Score</h2>
                      <h1>88%</h1>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2>Highest Marks</h2>
                      <h1>299 / 300</h1>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2>Average</h2>
                      <h1>255 / 300</h1>
                    </div>
                    <div className="flex flex-col gap-2 ml-auto">
                      <Button variant={"outline"}>View</Button>
                      <Button>
                        <Copy /> Exam Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
