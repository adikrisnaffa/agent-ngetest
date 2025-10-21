import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import SidebarContent from "@/components/dashboard/sidebar-content";
import MainDashboard from "@/components/dashboard/main-dashboard";

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent />
      </Sidebar>
      <SidebarInset>
        <MainDashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
