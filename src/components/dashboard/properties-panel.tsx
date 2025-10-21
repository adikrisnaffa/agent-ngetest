
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Workflow } from "lucide-react";
import type { Step, Action } from "./main-dashboard";
import { useState, useEffect } from "react";
import { Separator } from "../ui/separator";

interface PropertiesPanelProps {
  selectedStep: Step | null;
  onClose: () => void;
  onSave: (step: Step) => void;
}

const getActionLabel = (type: string) => {
    switch (type.toLowerCase()) {
        case "navigate": return { target: "Path (e.g. /login)", value: "N/A (Not Used)" };
        case "type": return { target: "Selector", value: "Text to Type" };
        case "click": return { target: "Selector", value: "N/A (Not Used)" };
        case "assert": return { target: "Selector or 'URL'", value: "Condition (e.g. 'is visible')" };
        default: return { target: "Target", value: "Value" };
    }
}

function ActionForm({ action, onActionChange }: { action: Action, onActionChange: (id: number, field: 'target' | 'value', value: string) => void }) {
    const labels = getActionLabel(action.type);

    return (
        <div className="space-y-3 p-3 border rounded-md bg-muted/20">
            <h4 className="font-semibold text-sm text-foreground">{action.type} Action</h4>
            <div className="space-y-2">
                <Label htmlFor={`action-target-${action.id}`}>{labels.target}</Label>
                <Input 
                    id={`action-target-${action.id}`} 
                    value={action.target} 
                    onChange={(e) => onActionChange(action.id, 'target', e.target.value)}
                />
            </div>
            {action.type !== 'Click' && action.type !== 'Navigate' && (
                <div className="space-y-2">
                    <Label htmlFor={`action-value-${action.id}`}>{labels.value}</Label>
                    <Input 
                        id={`action-value-${action.id}`} 
                        value={action.value}
                        onChange={(e) => onActionChange(action.id, 'value', e.target.value)}
                    />
                </div>
            )}
        </div>
    )
}

export default function PropertiesPanel({ selectedStep, onClose, onSave }: PropertiesPanelProps) {
  const [currentStep, setCurrentStep] = useState<Step | null>(selectedStep);

  useEffect(() => {
    setCurrentStep(selectedStep);
  }, [selectedStep]);

  const handleTitleChange = (value: string) => {
    if(currentStep) {
        setCurrentStep({ ...currentStep, title: value });
    }
  }

  const handleActionChange = (actionId: number, field: 'target' | 'value', value: string) => {
    if (currentStep) {
      const newActions = currentStep.actions.map(action => {
        if (action.id === actionId) {
          return { ...action, [field]: value };
        }
        return action;
      });
      setCurrentStep({ ...currentStep, actions: newActions });
    }
  };

  const handleSaveChanges = () => {
    if (currentStep) {
      onSave(currentStep);
      onClose();
    }
  };

  return (
    <div className={`transition-all duration-300 ease-in-out ${selectedStep ? 'w-96 ml-8' : 'w-0'}`}>
        <div className={`bg-background border-l h-full ${selectedStep ? 'block' : 'hidden'} overflow-hidden rounded-lg`}>
            {currentStep && (
                <div className="flex flex-col h-full">
                    <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Workflow className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Properties</h2>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                            <X className="h-5 w-5" />
                        </Button>
                    </header>
                    <div className="flex-1 p-6 space-y-6 overflow-auto">
                        <div className="space-y-2">
                            <Label htmlFor="step-name">Step Name</Label>
                            <Input 
                              id="step-name" 
                              value={currentStep.title}
                              onChange={(e) => handleTitleChange(e.target.value)}
                            />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                            <Label>Actions</Label>
                            {currentStep.actions.map(action => (
                                <ActionForm key={action.id} action={action} onActionChange={handleActionChange} />
                            ))}
                        </div>

                    </div>
                     <footer className="p-4 border-t mt-auto">
                        <Button className="w-full" onClick={handleSaveChanges}>Save Changes</Button>
                    </footer>
                </div>
            )}
        </div>
    </div>
  );
}
