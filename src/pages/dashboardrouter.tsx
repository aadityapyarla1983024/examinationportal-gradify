//@ts-nocheck
import React, { useContext, useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashBoardSideBar from "@/components/ui/dashboardsidebar";
import { Route, Routes, useNavigate } from "react-router-dom";
import EnterExamPage from "./enterexampage";
import CreateExamPage from "./createexampage";
import MyExamsPage from "./myexamspage";
import { DashboardPage } from "./dashboardpage";
import ProfilePage from "./profilepage";
import ExamAttemptViewPage from "./examattemptviewpage";
import ExamInfoPage from "./examinfopage";
import { UserContext } from "@/App";

export default function DashBoardRouter() {
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext);

  useEffect(() => {
    if (!user.loggedin && !loading) {
      navigate("/signin");
    }
  }, [user, navigate, loading]);
  if (!user.loggedin) {
    return null;
  }
  return (
    <>
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
    </>
  );
}
