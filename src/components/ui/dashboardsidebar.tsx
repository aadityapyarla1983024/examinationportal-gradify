//@ts-nocheck
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { DashBoardSideBarNavUser } from "./sidebarusernav";
import { useContext } from "react";
import { UserContext } from "@/App";

export default function DashBoardSideBar() {
  const { user, setUser } = useContext(UserContext);
  const userData = {
    name: user.first_name + " " + user.last_name,
    email: user.email,
    avatar: "https://avatars.githubusercontent.com/u/173893599?v=4",
  };
  const { toggleSidebar } = useSidebar();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-5 px-5 py-10">
            <Link to="/dashboard">
              <img src="/gradifyfullogo.svg" alt="" />
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/create-exam">Create Exam</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/enter-exam">Attempt Exam</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/myexams">My Exams</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/public-exams">Explore</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DashBoardSideBarNavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
