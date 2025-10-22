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

// Represent the structure of a flow document in Firestore
interface FlowDoc {
  title: string;
  steps: Step[];
}


export default function MainDashboard() {
  const [steps, setSteps] = useState<Step[]>([]);
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
  const [isRunning, setIsRunning] = useState(false);
  const runTimeoutRef = useRef<NodeJS.Timeout[]>([]);
  const [flowTitle, setFlowTitle] = useState("Untitled Flow");
  const [activeTab, setActiveTab] = useState("flow-builder");

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

    const cleanupTimeouts = () => {
        runTimeoutRef.current.forEach(clearTimeout);
        runTimeoutRef.current = [];
    };

    const handleRunTest = () => {
        if (isRunning) return;
        setIsRunning(true);
        cleanupTimeouts();

        let currentStepIndex = 0;
        
        setSteps(prev => prev.map(s => ({...s, status: 'idle'})));

        const runNextStep = () => {
            if (currentStepIndex >= steps.length) {
                const finalTimeout = setTimeout(() => {
                    setSteps(prev => prev.map(s => ({...s, status: 'idle'})));
                    setIsRunning(false);
                }, 1000);
                runTimeoutRef.current.push(finalTimeout);
                return;
            }

            const currentStepId = steps[currentStepIndex].id;

            setSteps(prev => prev.map(s => s.id === currentStepId ? {...s, status: 'running'} : s));

            const stepTimeout = setTimeout(() => {
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
                     const errorTimeout = setTimeout(() => {
                        setSteps(prev => prev.map(s => (s.status !== 'success' && s.status !== 'error') ? {...s, status: 'idle'} : s));
                        setIsRunning(false);
                     }, 1000);
                     runTimeoutRef.current.push(errorTimeout);
                }
            }, 1000); 
            runTimeoutRef.current.push(stepTimeout);
        }

        const startTimeout = setTimeout(runNextStep, 100);
        runTimeoutRef.current.push(startTimeout);
    };


    const handleStopTest = () => {
        cleanupTimeouts();
        setSteps(prev => prev.map(s => s.status === 'running' ? {...s, status: 'idle'} : s));
        setIsRunning(false);
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
            const highlightStyle = 'outline: 2px solid #BE52FF; background-color: rgba(190, 82, 255, 0.2); box-shadow: 0 0 10px rgba(190, 82, 255, 0.5);';

            function getCssSelector(el) {
              if (!(el instanceof Element)) return;
              let path = [];
              while (el && el.nodeType === Node.ELEMENT_NODE) {
                let selector = el.nodeName.toLowerCase();
                if (el.id) {
                  selector += '#' + el.id.replace( /(:|\\.|\\[)/g, '\\\\$1' );
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
              highlightedElement?.style.removeProperty('box-shadow');
              highlightedElement = e.target;
              highlightedElement.style.cssText += highlightStyle;
            }

            function handleMouseOut(e) {
              e.target.style.removeProperty('outline');
              e.target.style.removeProperty('background-color');
              e.target.style.removeProperty('box-shadow');
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
                highlightedElement?.style.removeProperty('box-shadow');
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

  const handleTitleChange = (newTitle: string) => {
    setFlowTitle(newTitle);
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onRun={handleRunTest} onStop={handleStopTest} isRunning={isRunning} onExport={handleExport} isExporting={isExporting} />
      <main className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="p-4 md:px-8 md:pt-8 md:pb-0">
            <TabsList>
              <TabsTrigger value="flow-builder">Flow Builder</TabsTrigger>
              <TabsTrigger value="inspector">Inspector</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="flow-builder" className="flex-1 overflow-hidden p-4 md:p-8 pt-4">
            <div className="flex-1 overflow-hidden h-full relative">
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
