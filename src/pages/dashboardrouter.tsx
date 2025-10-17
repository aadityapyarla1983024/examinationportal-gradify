import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashBoardSideBar from "@/components/ui/dashboardsidebar";
import { Route, Routes } from "react-router-dom";
import EnterExamPage from "./enterexampage";
import CreateExamPage from "./createexampage";
import MyExamsPage from "./myexamspage";
import { DashboardPage } from "./dashboardpage";
import ProfilePage from "./profilepage";
import ExamAttemptViewPage from "./examattemptviewpage";
import ExamInfoPage from "./examinfopage";
export default function DashBoardRouter() {
  return (
    <React.Fragment>
      <SidebarProvider>
        <DashBoardSideBar />
        <main className="w-full flex">
          <SidebarTrigger className="" />
          <Routes>
            <Route path="/enter-exam" element={<EnterExamPage />} />
            <Route path="/create-exam" element={<CreateExamPage />} />
            <Route path="/myexams" element={<MyExamsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/viewattempt" element={<ExamAttemptViewPage />} />
            <Route path="/examinfo" element={<ExamInfoPage />} />
            <Route path="/" element={<DashboardPage />} />
          </Routes>
        </main>
      </SidebarProvider>
    </React.Fragment>
  );
}
