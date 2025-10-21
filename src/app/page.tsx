"use client";
import { useState } from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import SidebarContent from "@/components/dashboard/sidebar-content";
import MainDashboard from "@/components/dashboard/main-dashboard";
import NodePalette from "@/components/dashboard/node-palette";

// Placeholder component for other views
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">This view is under construction.</p>
    </div>
  </div>
);


export default function Home() {
  const [activeView, setActiveView] = useState("Flow Builder");

  const renderContent = () => {
    switch(activeView) {
      case "Flow Builder":
        return <MainDashboard />;
      case "Configuration":
      case "Authentication":
      case "Scan Config":
      case "Repository":
      case "Test Settings":
        return <PlaceholderView title={activeView} />;
      default:
        return <MainDashboard />;
    }
  }

  return (
    <div className="flex h-screen w-full">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent activeView={activeView} setActiveView={setActiveView} />
        </Sidebar>
        <NodePalette />
        <SidebarInset>
          {renderContent()}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
