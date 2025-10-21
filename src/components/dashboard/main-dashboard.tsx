import Header from "@/components/layout/header";
import FlowCanvas from "@/components/dashboard/flow-canvas";

export default function MainDashboard() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-hidden p-4 md:p-8">
        <FlowCanvas />
      </main>
    </div>
  );
}
