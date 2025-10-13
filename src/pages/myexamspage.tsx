import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <ScrollArea className="h-72 w-full rounded-md border">
              <h1 className="p-4">Exams you have created will appear here.</h1>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="exams-attempted">
          <div className="p-4 md:p-8">
            <ScrollArea className="w-full h-72 rounded-md border">
              <h1 className="p-4">No Exams Attempted</h1>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
