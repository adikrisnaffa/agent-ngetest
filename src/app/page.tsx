"use client";
import { useState } from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import SidebarContent from "@/components/dashboard/sidebar-content";
import MainDashboard from "@/components/dashboard/main-dashboard";
import AuthenticationView from "@/components/dashboard/authentication-view";
import ScanConfigView from "@/components/dashboard/scan-config-view";
import TestSettingsView from "@/components/dashboard/test-settings-view";
import RepositoryView from "@/components/dashboard/repository-view";
import ReportingView from "@/components/dashboard/reporting-view";

// Placeholder component for other views
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex h-full w-full items-center justify-center p-8">
    <div className="text-center bg-card border rounded-lg p-8 w-full max-w-2xl">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">Konten untuk halaman ini sedang dalam tahap pengembangan.</p>
    </div>
  </div>
);


export default function Home() {
  const [activeView, setActiveView] = useState("Flow Builder");

  const renderContent = () => {
    switch(activeView) {
      case "Flow Builder":
        return <MainDashboard />;
      case "Authentication":
        return <AuthenticationView />;
      case "Scan Config":
        return <ScanConfigView />;
      case "Test Settings":
        return <TestSettingsView />;
      case "Repository":
        return <RepositoryView />;
      case "Reporting":
        return <ReportingView />;
      case "Configuration":
        return <PlaceholderView title={activeView} />;
      default:
        return <MainDashboard />;
    }
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent activeView={activeView} setActiveView={setActiveView} />
        </Sidebar>
        <SidebarInset>
          {renderContent()}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
