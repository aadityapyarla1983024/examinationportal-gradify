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

export default function DashBoardSideBar() {
  const user = {
    name: "Aaditya Pyarla",
    email: "aaditya.pyarla@gmail.com",
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
                  <Link to="/dashboard/create-exam">Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/create-exam">Create Exam</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/enter-exam">Enter Exam Code</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/my-exams">My Exams</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DashBoardSideBarNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
