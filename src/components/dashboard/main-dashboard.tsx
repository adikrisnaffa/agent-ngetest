"use client";

import Header from "@/components/layout/header";
import FlowCanvas from "@/components/dashboard/flow-canvas";
import PropertiesPanel from "./properties-panel";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Globe, Play } from "lucide-react";

export type Step = {
  id: number;
  title: string;
  type: string;
  actions: { type: string; detail: string }[];
  status: 'idle' | 'running' | 'success' | 'error';
}

const initialSteps: Step[] = [
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
      status: 'idle',
    },
    {
      id: 2,
      title: "Assert Login",
      type: "Group",
      actions: [
        { type: "Assert", detail: "URL is /dashboard" },
        { type: "Assert", detail: "Welcome message is visible"},
      ],
      status: 'idle',
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
      status: 'idle',
    },
];


export default function MainDashboard() {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  const handleAddStep = (type: string) => {
    const newStep: Step = {
        id: steps.length + 1,
        title: `${type} Step`,
        type: type,
        actions: [{ type: type, detail: `Configure this ${type} action` }],
        status: 'idle'
    };
    setSteps([...steps, newStep]);
  }

  const handleRunTest = () => {
    // Simulate test run
    let currentStep = 0;
    
    const runNextStep = () => {
        if (currentStep >= steps.length) {
            // Reset all to idle after a short delay
            setTimeout(() => setSteps(prev => prev.map(s => ({...s, status: 'idle'}))), 1000);
            return;
        }

        // Set current step to running
        setSteps(prev => prev.map(s => s.id === steps[currentStep].id ? {...s, status: 'running'} : s));

        setTimeout(() => {
            const isSuccess = Math.random() > 0.2; // 80% chance of success
            setSteps(prev => prev.map(s => {
                if (s.id === steps[currentStep].id) {
                    return {...s, status: isSuccess ? 'success' : 'error' };
                }
                return s;
            }));

            if(isSuccess) {
                currentStep++;
                runNextStep();
            } else {
                 // Stop on error and reset others
                 setTimeout(() => setSteps(prev => prev.map(s => s.status === 'running' ? {...s, status: 'idle'} : s)), 1000);
            }
        }, 1000); // 1 second per step
    }

    // Reset all to idle before starting
    setSteps(prev => prev.map(s => ({...s, status: 'idle'})))
    setTimeout(runNextStep, 500);
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onRun={handleRunTest} />
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
                <FlowCanvas 
                    steps={steps} 
                    onStepSelect={setSelectedStep} 
                    selectedStepId={selectedStep?.id ?? null}
                    onAddStep={handleAddStep}
                />
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
