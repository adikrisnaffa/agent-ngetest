
"use client";

import Header from "@/components/layout/header";
import FlowCanvas from "@/components/dashboard/flow-canvas";
import PropertiesPanel from "./properties-panel";
import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InspectorPanel from "./inspector-panel";
import { Globe, Loader2, FileSearch, ArrowLeft } from "lucide-react";
import { NodePalette } from "../dashboard/node-palette";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirebase, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { debounce } from 'lodash';

export type Action = {
  id: number;
  type: string;
  target: string;
  value: string;
};

export type Step = {
  id: number;
  title: string;
  type: string;
  actions: Action[];
  status: 'idle' | 'running' | 'success' | 'error';
}

interface FlowDoc {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
}

interface MainDashboardProps {
  selectedProject: { id: string; name: string } | null;
  onBackToProjects: () => void;
}

export default function MainDashboard({ selectedProject, onBackToProjects }: MainDashboardProps) {
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const [steps, setSteps] = useState<Step[]>([]);
  const [flowTitle, setFlowTitle] = useState("Untitled Flow");
  const [flowId, setFlowId] = useState<string | null>(null);

  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [inspectorUrl, setInspectorUrl] = useState("http://172.16.0.102:85/backend/login");
  const [iframeContent, setIframeContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [selectedElementSelector, setSelectedElementSelector] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("flow-builder");

  // This will be the single flow for a given project for now.
  const flowDocRef = useMemoFirebase(() => {
    if (!user || !firestore || !selectedProject) return null;
    // We'll use a consistent ID for the flow doc per project for simplicity
    const deterministicFlowId = `flow_for_${selectedProject.id}`;
    return doc(firestore, `users/${user.uid}/projects/${selectedProject.id}/endToEndFlows`, deterministicFlowId);
  }, [user, firestore, selectedProject]);

  const { data: flowDoc, isLoading: isFlowLoading } = useDoc<FlowDoc>(flowDocRef);

  const debouncedUpdate = useCallback(
    debounce((flowData: Partial<FlowDoc>) => {
      if (flowDocRef) {
        updateDocumentNonBlocking(flowDocRef, flowData);
      }
    }, 1000), // Debounce updates by 1 second
    [flowDocRef]
  );
  
  useEffect(() => {
    if (flowDoc) {
      setSteps(flowDoc.steps || []);
      setFlowTitle(flowDoc.name || `Flow for ${selectedProject?.name}`);
      setFlowId(flowDoc.id);
    } else if (selectedProject) {
      // If no flow doc exists, initialize with default state
      const newTitle = `Flow for ${selectedProject.name}`;
      setFlowTitle(newTitle);
      setSteps([]);
      // Create the document if it doesn't exist.
      if (flowDocRef) {
         updateDocumentNonBlocking(flowDocRef, { name: newTitle, steps: [] });
      }
    }
  }, [flowDoc, selectedProject, flowDocRef]);
  
  useEffect(() => {
    // When title or steps change, trigger a debounced update to Firestore
    if (!isFlowLoading && flowDocRef) {
      debouncedUpdate({ name: flowTitle, steps: steps });
    }
  }, [flowTitle, steps, isFlowLoading, debouncedUpdate, flowDocRef]);


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
    setSelectedElementSelector('');
    setActiveTab("flow-builder");
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
        
        if (targetId === 0) {
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
          const errorResult = await response.json();
          throw new Error(errorResult.details || 'Test execution failed on the server.');
        }

        const { results } = await response.json();
        
        for (const result of results) {
            setSteps(prev => prev.map(s => s.id === result.stepId ? {...s, status: result.status } : s));
            if (result.status === 'error') {
              break; 
            }
        }

      } catch (error: any) {
        console.error("Failed to run test:", error);
        toast({
            variant: "destructive",
            title: "Test Run Failed",
            description: error.message,
        });
      } finally {
        setIsRunning(false);
      }
    };


    const handleStopTest = () => {
        setIsRunning(false);
        setSteps(prev => prev.map(s => s.status === 'running' ? {...s, status: 'idle'} : s));
    }
  
  const handleLoadInspector = async (url?: string) => {
    const urlToLoad = url || inspectorUrl;
    setIsLoading(true);
    setIframeContent(`<html><body><div style="font-family: sans-serif; padding: 2rem;"><h1>Inspector Disabled</h1><p>This feature is currently disabled due to technical limitations in reliably fetching external content.</p><p>URL: ${urlToLoad}</p></div></html>`);
    setIsLoading(false);
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'element-selected') {
        setSelectedElementSelector(event.data.selector);
        setIsInspectorActive(false);
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

  if (!selectedProject) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-background">
        <FileSearch className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold">Select a Project</h2>
        <p className="text-muted-foreground max-w-md mt-2">
          To start building a flow, please go to the 'Reporting' section and select a project, or create a new one.
        </p>
         <Button onClick={() => onBackToProjects()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Projects
        </Button>
      </div>
    )
  }
  
  if (isFlowLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-4 text-muted-foreground">Loading flow...</p>
        </div>
    );
  }

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
        <NodePalette onAddNode={handleAddStep} />
        <main className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="p-4 md:px-8 md:pt-8 md:pb-0 flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="flow-builder">Flow Builder</TabsTrigger>
                <TabsTrigger value="inspector">Inspector</TabsTrigger>
              </TabsList>
               <Button variant="ghost" onClick={onBackToProjects}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Projects
                </Button>
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
