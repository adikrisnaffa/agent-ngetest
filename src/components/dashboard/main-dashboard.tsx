
"use client";

import Header from "@/components/layout/header";
import FlowCanvas from "@/components/dashboard/flow-canvas";
import PropertiesPanel from "./properties-panel";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InspectorPanel from "./inspector-panel";
import { Globe, Loader2 } from "lucide-react";
import { NodePalette } from "../dashboard/node-palette";
import { useToast } from "@/hooks/use-toast";

export type Action = {
  id: number;
  type: string; // e.g., Navigate, Type, Click, Assert
  target: string; // CSS selector or URL
  value: string; // Text to type or value to assert
};

export type Step = {
  id: number;
  title: string;
  type: string;
  actions: Action[];
  status: 'idle' | 'running' | 'success' | 'error';
}

// Represent the structure of a flow document in Firestore
interface FlowDoc {
  title: string;
  steps: Step[];
}

export default function MainDashboard() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [inspectorUrl, setInspectorUrl] = useState("http://172.16.0.102:85/backend/login");
  const [iframeContent, setIframeContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [selectedElementSelector, setSelectedElementSelector] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [flowTitle, setFlowTitle] = useState("Untitled Flow");
  const [activeTab, setActiveTab] = useState("flow-builder");
  const { toast } = useToast();


  const handleAddStep = (type: string, target?: string) => {
    const newStep: Step = {
        id: Date.now(),
        title: `${type} Step`,
        type: type,
        actions: [{ id: Date.now(), type: type, target: target || "your-selector", value: "" }],
        status: 'idle'
    };
    setSteps(prev => [...prev, newStep]);
    setSelectedStep(newStep);
  }

  const handleCreateStepFromInspector = (selector: string) => {
    if (!selector) return;

    // Simple logic to guess the action type
    let actionType = 'Click';
    const lowerSelector = selector.toLowerCase();
    const isInput = lowerSelector.includes('input') || lowerSelector.includes('textarea') || lowerSelector.match(/\[contenteditable\s*=\s*['"]?true['"]?\]/);

    if (isInput) {
        actionType = 'Type';
    } else if (lowerSelector.includes('button') || lowerSelector.includes('a[href]')) {
        actionType = 'Click';
    }

    const newStep: Step = {
        id: Date.now(),
        title: `${actionType} on element`,
        type: actionType,
        actions: [{ id: Date.now(), type: actionType, target: selector, value: "" }],
        status: 'idle'
    };

    setSteps(prevSteps => [...prevSteps, newStep]);
    setSelectedStep(newStep);
    setSelectedElementSelector(''); // Clear selector after creating step
    setActiveTab("flow-builder"); // Switch back to the flow builder
  };

  const handleUpdateStep = (updatedStep: Step) => {
    setSteps(steps.map(step => step.id === updatedStep.id ? updatedStep : step));
    if (selectedStep?.id === updatedStep.id) {
      setSelectedStep(updatedStep);
    }
  };

  const handleDeleteStep = (id: number) => {
    setSteps(steps.filter(step => step.id !== id));
    if (selectedStep?.id === id) {
      setSelectedStep(null);
    }
  };

  const handleMoveStep = (draggedId: number, targetId: number) => {
    setSteps(prevSteps => {
        const draggedStep = prevSteps.find(step => step.id === draggedId);
        if (!draggedStep) return prevSteps;

        const remainingSteps = prevSteps.filter(step => step.id !== draggedId);
        
        if (targetId === 0) { // Dropped at the very beginning
            return [draggedStep, ...remainingSteps];
        }

        const targetIndex = remainingSteps.findIndex(step => step.id === targetId);
        const newIndex = targetIndex + 1;

        if (newIndex >= 0 && newIndex <= remainingSteps.length) {
            const newSteps = [...remainingSteps];
            newSteps.splice(newIndex, 0, draggedStep);
            return newSteps;
        }
        
        return prevSteps;
    });
  };

    const handleRunTest = async () => {
      if (isRunning) return;
      setIsRunning(true);
      // Reset all statuses to idle
      setSteps(prev => prev.map(s => ({...s, status: 'idle'})));

      try {
        const response = await fetch('/api/run-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ steps }),
        });

        if (!response.ok) {
          throw new Error('Test execution failed on the server.');
        }

        const { results } = await response.json();
        
        for (const result of results) {
            setSteps(prev => prev.map(s => s.id === result.stepId ? {...s, status: result.status } : s));
            if (result.status === 'error') {
              break; // Stop updating statuses on first error
            }
        }

      } catch (error) {
        console.error("Failed to run test:", error);
        // Optionally, show a toast notification for the error
      } finally {
        setIsRunning(false);
      }
    };


    const handleStopTest = () => {
        // With a real backend, stopping a test is more complex.
        // For now, this just resets the UI state.
        setIsRunning(false);
        setSteps(prev => prev.map(s => s.status === 'running' ? {...s, status: 'idle'} : s));
    }
  
  const handleLoadInspector = async (url?: string) => {
    // This functionality is disabled as it's not reliable.
    const urlToLoad = url || inspectorUrl;
    setIsLoading(true);
    setIframeContent(`<html><body><div style="font-family: sans-serif; padding: 2rem;"><h1>Inspector Disabled</h1><p>This feature is currently disabled due to technical limitations in reliably fetching external content.</p><p>URL: ${urlToLoad}</p></div></html>`);
    setIsLoading(false);
  }

  // Handle messaging from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'element-selected') {
        setSelectedElementSelector(event.data.selector);
        setIsInspectorActive(false); // Turn off inspector mode after selection
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setFlowTitle(newTitle);
  }

  const handleCreateNewFlow = () => {
    setSteps([]);
    setFlowTitle("Untitled Flow");
    setSelectedStep(null);
  };

  const handleExportToExcel = async () => {
    if (steps.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot Export",
        description: "Your flow is empty. Add some steps before exporting.",
      });
      return;
    }
    setIsExporting(true);
    try {
      const response = await fetch('/api/generate-test-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: flowTitle, steps }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Excel file.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Sanitize title for filename
      const fileName = `${flowTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_test_case.xlsx`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Test case '${fileName}' has been downloaded.`,
      });

    } catch (error: any) {
      console.error("Export failed:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message || "Could not generate the Excel file.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header 
        onRun={handleRunTest} 
        onStop={handleStopTest} 
        onExport={handleExportToExcel}
        isRunning={isRunning}
        isExporting={isExporting}
      />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette onAddNode={handleAddStep} onCreateFlow={handleCreateNewFlow} />
        <main className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="p-4 md:px-8 md:pt-8 md:pb-0">
              <TabsList>
                <TabsTrigger value="flow-builder">Flow Builder</TabsTrigger>
                <TabsTrigger value="inspector">Inspector</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="flow-builder" className="flex-1 overflow-y-auto p-4 md:p-8 pt-4">
                <div className="h-full flex flex-col gap-4">
                    <div className="flex-grow">
                        <FlowCanvas 
                            steps={steps} 
                            onStepSelect={setSelectedStep} 
                            selectedStepId={selectedStep?.id ?? null}
                            onAddStep={handleAddStep}
                            onDeleteStep={handleDeleteStep}
                            onMoveStep={handleMoveStep}
                            flowTitle={flowTitle}
                            onTitleChange={handleTitleChange}
                        />
                    </div>
                    <PropertiesPanel 
                        key={selectedStep?.id}
                        selectedStep={selectedStep} 
                        onClose={() => setSelectedStep(null)}
                        onSave={handleUpdateStep}
                    />
                </div>
            </TabsContent>
            <TabsContent value="inspector" className="flex-1 overflow-hidden p-4 md:p-8 pt-4 flex flex-col gap-4">
              <InspectorPanel 
                url={inspectorUrl}
                onUrlChange={setInspectorUrl}
                onLoad={handleLoadInspector}
                isLoading={isLoading}
                isInspectorActive={isInspectorActive}
                onToggleInspector={() => setIsInspectorActive(!isInspectorActive)}
                selector={selectedElementSelector}
                onCreateStep={handleCreateStepFromInspector}
              />
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
                      <iframe ref={iframeRef} srcDoc={iframeContent} className="w-full h-full" title="Web Inspector" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
                  ) : (
                      <div className="flex items-center justify-center h-full">
                          <div className="text-center text-muted-foreground">
                              <Globe className="h-10 w-10 mx-auto mb-4 text-border" />
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
    </div>
  );
}
