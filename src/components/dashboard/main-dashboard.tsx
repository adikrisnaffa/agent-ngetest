"use client";

import Header from "@/components/layout/header";
import FlowCanvas from "@/components/dashboard/flow-canvas";
import PropertiesPanel from "./properties-panel";
import { useState } from "react";

export type Step = {
  id: number;
  title: string;
  type: string;
  actions: { type: string; detail: string }[];
}

export default function MainDashboard() {
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  const steps: Step[] = [
    {
      id: 1,
      title: "User Login",
      type: "Group",
      actions: [
        { type: "Navigate", detail: "to /login" },
        { type: "Type", detail: "'testuser' in Username" },
        { type: "Type", detail: "'password' in Password" },
        { type: "Click", detail: "Login Button" },
      ],
    },
    {
      id: 2,
      title: "Assert Login",
      type: "Group",
      actions: [
        { type: "Assert", detail: "URL is /dashboard" },
        { type: "Assert", detail: "Welcome message is visible"},
      ],
    },
    {
      id: 3,
      title: "Add Product",
      type: "Group",
      actions: [
        { type: "Click", detail: "Product 'Automation'" },
        { type: "Click", detail: "Add to Cart Button" },
        { type: "Assert", detail: "Cart count is 1" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-hidden p-4 md:p-8 flex">
        <div className="flex-1 overflow-hidden h-full">
            <FlowCanvas steps={steps} onStepSelect={setSelectedStep} selectedStepId={selectedStep?.id ?? null} />
        </div>
        <PropertiesPanel selectedStep={selectedStep} onClose={() => setSelectedStep(null)} />
      </main>
    </div>
  );
}
