import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashBoardSideBar from "@/components/ui/dashboardsidebar";
import { Route, Routes } from "react-router-dom";
import EnterExamPage from "./enterexampage";

export default function DashBoardPage() {
  return (
    <React.Fragment>
      <SidebarProvider>
        <DashBoardSideBar />
        <main className="w-full flex">
          <SidebarTrigger className="md:hidden" />
          <Routes>
            <Route path="enter-exam" element={<EnterExamPage />} />
          </Routes>
        </main>
      </SidebarProvider>
    </React.Fragment>
  );
}
