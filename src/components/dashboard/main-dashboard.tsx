"use client";

import Header from "@/components/layout/header";
import FlowCanvas from "@/components/dashboard/flow-canvas";
import PropertiesPanel from "./properties-panel";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Globe } from "lucide-react";

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
      <main className="flex-1 overflow-hidden">
        <Tabs defaultValue="flow-builder" className="h-full flex flex-col">
          <div className="p-4 md:px-8 md:pt-8 md:pb-0">
            <TabsList>
              <TabsTrigger value="flow-builder">Flow Builder</TabsTrigger>
              <TabsTrigger value="inspector">Inspector</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="flow-builder" className="flex-1 overflow-hidden p-4 md:p-8 pt-4 flex">
            <div className="flex-1 overflow-hidden h-full">
                <FlowCanvas steps={steps} onStepSelect={setSelectedStep} selectedStepId={selectedStep?.id ?? null} />
            </div>
            <PropertiesPanel selectedStep={selectedStep} onClose={() => setSelectedStep(null)} />
          </TabsContent>
          <TabsContent value="inspector" className="flex-1 overflow-hidden p-4 md:p-8 pt-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Input placeholder="https://example.com" />
                <Button>
                    <Globe className="mr-2 h-4 w-4" />
                    Load Page
                </Button>
            </div>
            <div className="flex-1 border rounded-lg bg-muted/20 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <p className="font-medium">Web Inspector</p>
                    <p className="text-sm">Enter a URL and click "Load Page" to begin inspecting elements.</p>
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
