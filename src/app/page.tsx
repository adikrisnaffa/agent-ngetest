import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import SidebarContent from "@/components/dashboard/sidebar-content";
import MainDashboard from "@/components/dashboard/main-dashboard";
import NodePalette from "@/components/dashboard/node-palette";

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent />
      </Sidebar>
      <NodePalette />
      <SidebarInset>
        <MainDashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
