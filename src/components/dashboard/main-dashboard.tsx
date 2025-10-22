
"use client";

import Header from "@/components/layout/header";
import FlowCanvas from "@/components/dashboard/flow-canvas";
import PropertiesPanel from "./properties-panel";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InspectorPanel from "./inspector-panel";
import { Loader2 } from "lucide-react";
import { fetchUrlContent } from "@/app/actions";
import { generateTest } from "@/ai/flows/generate-test-flow";
import type { GenerateTestInput } from "@/ai/flows/schemas";
import CodeDialog from "./code-dialog";

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

const initialSteps: Step[] = [
    {
      id: 1,
      title: "User Login",
      type: "Group",
      actions: [
        { id: 1, type: "Navigate", target: "/login", value: "" },
        { id: 2, type: "Type", target: "input[name='username']", value: "testuser" },
        { id:3, type: "Type", target: "input[name='password']", value: "password" },
        { id: 4, type: "Click", target: "button[type='submit']", value: "" },
      ],
      status: 'idle',
    },
    {
      id: 2,
      title: "Assert Login",
      type: "Group",
      actions: [
        { id: 1, type: "Assert", target: "URL", value: "/dashboard" },
        { id: 2, type: "Assert", target: ".welcome-message", value: "is visible"},
      ],
      status: 'idle',
    },
    {
      id: 3,
      title: "Add Product",
      type: "Group",
      actions: [
        { id: 1, type: "Click", target: "#product-automation", value: "" },
        { id: 2, type: "Click", target: ".add-to-cart-btn", value: "" },
        { id: 3, type: "Assert", target: ".cart-count", value: "is 1" },
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
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [selectedElementSelector, setSelectedElementSelector] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);

  const handleAddStep = (type: string) => {
    const newStep: Step = {
        id: Date.now(), // Use a more unique ID
        title: `${type} Step`,
        type: type,
        actions: [{ id: Date.now(), type: type, target: "your-selector", value: `your-value` }],
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
        const targetIndex = remainingSteps.findIndex(step => step.id === targetId);
        
        // If dropping at the beginning
        if (targetId === 0) {
            return [draggedStep, ...remainingSteps];
        }

        const newIndex = targetIndex + 1;

        if (newIndex >= 0 && newIndex <= remainingSteps.length) {
            const newSteps = [...remainingSteps];
            newSteps.splice(newIndex, 0, draggedStep);
            return newSteps;
        }
        
        return prevSteps;
    });
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
  
  const handleLoadInspector = async (url?: string) => {
    const urlToLoad = url || inspectorUrl;
    if (!urlToLoad) return;

    setIsLoading(true);
    setIframeContent(null);
    try {
        let finalUrl = urlToLoad;
        if (!finalUrl.startsWith('http')) {
            finalUrl = 'https://' + finalUrl;
        }
        setInspectorUrl(finalUrl);
        const content = await fetchUrlContent(finalUrl);
        setIframeContent(content);
    } catch (error) {
        console.error("Failed to fetch content:", error);
        setIframeContent("<p>Failed to load page. Please check the URL and try again.</p>");
    } finally {
        setIsLoading(false);
    }
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

  // Inject script into iframe when inspector mode is toggled
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      const doc = iframe.contentWindow.document;
      const scriptId = 'inspector-script';
      let script = doc.getElementById(scriptId) as HTMLScriptElement | null;

      if (isInspectorActive) {
        if (!script) {
          script = doc.createElement('script');
          script.id = scriptId;
          script.innerHTML = `
            let highlightedElement = null;
            const highlightStyle = 'outline: 2px solid #6366f1; background-color: rgba(99, 102, 241, 0.2);';

            function getCssSelector(el) {
              if (!(el instanceof Element)) return;
              const path = [];
              while (el.nodeType === Node.ELEMENT_NODE) {
                let selector = el.nodeName.toLowerCase();
                if (el.id) {
                  selector += '#' + el.id;
                  path.unshift(selector);
                  break;
                } else {
                  let sib = el, nth = 1;
                  while (sib = sib.previousElementSibling) {
                    if (sib.nodeName.toLowerCase() == selector) nth++;
                  }
                  if (nth != 1) selector += ":nth-of-type("+nth+")";
                }
                path.unshift(selector);
                el = el.parentNode;
              }
              return path.join(" > ");
            }

            function handleMouseOver(e) {
              highlightedElement?.style.removeProperty('outline');
              highlightedElement?.style.removeProperty('background-color');
              highlightedElement = e.target;
              highlightedElement.style.cssText += highlightStyle;
            }

            function handleMouseOut(e) {
              e.target.style.removeProperty('outline');
              e.target.style.removeProperty('background-color');
            }
            
            function handleClick(e) {
                e.preventDefault();
                e.stopPropagation();

                const selector = getCssSelector(e.target);
                window.parent.postMessage({ type: 'element-selected', selector: selector }, '*');
                
                // Cleanup
                document.removeEventListener('mouseover', handleMouseOver);
                document.removeEventListener('mouseout', handleMouseOut);
                document.removeEventListener('click', handleClick, true);
                highlightedElement?.style.removeProperty('outline');
                highlightedElement?.style.removeProperty('background-color');
            }

            document.addEventListener('mouseover', handleMouseOver);
            document.addEventListener('mouseout', handleMouseOut);
            document.addEventListener('click', handleClick, true);
          `;
          doc.body.appendChild(script);
        }
      } else {
        if (script) {
          script.remove();
          // We might need to send a message to the script to remove its own listeners
        }
      }
    }
  }, [isInspectorActive, iframeContent]);


  const handleExport = async (target: GenerateTestInput['target']) => {
    setIsExporting(true);
    setGeneratedCode("");
    setIsCodeDialogOpen(true);

    try {
      const result = await generateTest({
        steps: steps.map(s => ({
          title: s.title,
          actions: s.actions.map(a => {
            // Reconstruct the 'detail' string for the AI prompt
            let detail = '';
            if (a.type === 'Navigate') {
              detail = a.target;
            } else if (a.type === 'Type') {
              detail = `'${a.value}' in ${a.target}`;
            } else if (a.type === 'Assert') {
              detail = `${a.target} ${a.value}`;
            } else { // Click
              detail = a.target;
            }
            return {
              type: a.type,
              detail: detail
            }
          })
        })),
        target,
        url: inspectorUrl,
      });
      setGeneratedCode(result.code);
    } catch (error) {
      console.error("Failed to generate test:", error);
      setGeneratedCode(`// An error occurred while generating the test script for ${target}.\n// Please check the console for more details.`);
    } finally {
      setIsExporting(false);
    }
  }


  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onRun={handleRunTest} onExport={handleExport} isExporting={isExporting} />
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
                    onDeleteStep={handleDeleteStep}
                    onMoveStep={handleMoveStep}
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
            <InspectorPanel 
              url={inspectorUrl}
              onUrlChange={setInspectorUrl}
              onLoad={handleLoadInspector}
              isLoading={isLoading}
              isInspectorActive={isInspectorActive}
              onToggleInspector={() => setIsInspectorActive(!isInspectorActive)}
              selector={selectedElementSelector}
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
                            <p className="font-medium">Web Inspector</p>
                            <p className="text-sm">Enter a URL and click "Load Page" to begin inspecting elements.</p>
                        </div>
                    </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <CodeDialog 
        isOpen={isCodeDialogOpen}
        onOpenChange={setIsCodeDialogOpen}
        code={generatedCode}
        isLoading={isExporting}
      />
    </div>
  );
}
