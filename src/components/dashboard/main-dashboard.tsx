"use client";

import Header from "@/components/layout/header";
import FlowCanvas from "@/components/dashboard/flow-canvas";
import PropertiesPanel from "./properties-panel";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Globe, Play, RefreshCw, Loader2 } from "lucide-react";
import { fetchUrlContent } from "@/app/actions";

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
  const [inspectorUrl, setInspectorUrl] = useState("https://www.google.com");
  const [iframeContent, setIframeContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddStep = (type: string) => {
    const newStep: Step = {
        id: Date.now(), // Use a more unique ID
        title: `${type} Step`,
        type: type,
        actions: [{ type: type, detail: `Configure this ${type} action` }],
        status: 'idle'
    };
    setSteps([...steps, newStep]);
    setSelectedStep(newStep); // Select the new step
  }

  const handleUpdateStep = (updatedStep: Step) => {
    setSteps(steps.map(step => step.id === updatedStep.id ? updatedStep : step));
    if (selectedStep?.id === updatedStep.id) {
      setSelectedStep(updatedStep);
    }
  };

  const handleRunTest = () => {
    // Simulate test run
    let currentStepIndex = 0;
    
    const runNextStep = () => {
        if (currentStepIndex >= steps.length) {
            // Reset all to idle after a short delay
            setTimeout(() => setSteps(prev => prev.map(s => ({...s, status: 'idle'}))), 1000);
            return;
        }

        const currentStepId = steps[currentStepIndex].id;

        // Set current step to running
        setSteps(prev => prev.map(s => s.id === currentStepId ? {...s, status: 'running'} : s));

        setTimeout(() => {
            const isSuccess = Math.random() > 0.2; // 80% chance of success
            setSteps(prev => prev.map(s => {
                if (s.id === currentStepId) {
                    return {...s, status: isSuccess ? 'success' : 'error' };
                }
                return s;
            }));

            if(isSuccess) {
                currentStepIndex++;
                runNextStep();
            } else {
                 // Stop on error and reset others not yet run
                 setSteps(prev => prev.map(s => (s.status !== 'success' && s.status !== 'error') ? {...s, status: 'idle'} : s));
            }
        }, 1000); // 1 second per step
    }

    // Reset all to idle before starting
    setSteps(prev => prev.map(s => ({...s, status: 'idle'})))
    setTimeout(runNextStep, 500);
  }
  
  const handleLoadInspector = async () => {
    if (!inspectorUrl) return;
    setIsLoading(true);
    setIframeContent(null);
    try {
        let urlToLoad = inspectorUrl;
        if (!urlToLoad.startsWith('http')) {
            urlToLoad = 'https://' + urlToLoad;
        }
        const content = await fetchUrlContent(urlToLoad);
        setIframeContent(content);
    } catch (error) {
        console.error("Failed to fetch content:", error);
        setIframeContent("<p>Failed to load page. Please check the URL and try again.</p>");
    } finally {
        setIsLoading(false);
    }
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
            <PropertiesPanel 
              key={selectedStep?.id} // Add key to re-mount component on selection change
              selectedStep={selectedStep} 
              onClose={() => setSelectedStep(null)}
              onSave={handleUpdateStep}
            />
          </TabsContent>
          <TabsContent value="inspector" className="flex-1 overflow-hidden p-4 md:p-8 pt-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
                <Input 
                    placeholder="https://example.com" 
                    value={inspectorUrl}
                    onChange={(e) => setInspectorUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadInspector()}
                    disabled={isLoading}
                />
                <Button onClick={handleLoadInspector} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                    Load Page
                </Button>
                <Button variant="outline" size="icon" onClick={handleLoadInspector} disabled={!iframeContent || isLoading}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1 border rounded-lg bg-card overflow-hidden">
                {isLoading ? (
                     <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p className="font-medium">Loading Page...</p>
                            <p className="text-sm">Please wait while we fetch the content.</p>
                        </div>
                    </div>
                ) : iframeContent ? (
                    <iframe srcDoc={iframeContent} className="w-full h-full" title="Web Inspector" sandbox="allow-scripts allow-same-origin" />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                            <p className="font-medium">Web Inspector</p>
                            <p className="text-sm">Enter a URL and click "Load Page" to begin inspecting elements.</p>
                        </div>
                    </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
