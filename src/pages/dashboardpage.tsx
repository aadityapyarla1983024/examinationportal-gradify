import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashBoardSideBar from "@/components/ui/dashboardsidebar";
import { Route, Routes } from "react-router-dom";
import EnterExamPage from "./enterexampage";
import CreateExamPage from "./createexampage";
import MyExamsPage from "./myexamspage";

export default function DashBoardPage() {
  return (
    <React.Fragment>
      <SidebarProvider>
        <DashBoardSideBar />
        <main className="w-full flex">
          <SidebarTrigger className="" />
          <Routes>
            <Route path="enter-exam" element={<EnterExamPage />} />
            <Route path="create-exam" element={<CreateExamPage />} />
            <Route path="myexams" element={<MyExamsPage />} />
          </Routes>
        </main>
      </SidebarProvider>
    </React.Fragment>
  );
}
