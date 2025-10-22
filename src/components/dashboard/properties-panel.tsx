
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Workflow, Trash2, Plus, MousePointerClick, Type, Search, Forward } from "lucide-react";
import type { Step, Action } from "./main-dashboard";
import { useState, useEffect } from "react";
import { Separator } from "../ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

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

function ActionForm({ 
  action, 
  onActionChange, 
  onActionDelete 
}: { 
  action: Action, 
  onActionChange: (id: number, field: 'target' | 'value', value: string) => void,
  onActionDelete: (id: number) => void
}) {
    const labels = getActionLabel(action.type);

    return (
        <div className="space-y-3 p-3 border rounded-md bg-muted/20 relative group/action">
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
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover/action:opacity-100"
              onClick={() => onActionDelete(action.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

const AddActionButton = ({ onAddAction }: { onAddAction: (type: string) => void }) => {
    const actionTypes = [
        { name: "Click", icon: MousePointerClick },
        { name: "Type", icon: Type },
        { name: "Assert", icon: Search },
        { name: "Navigate", icon: Forward },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Action
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {actionTypes.map(action => (
                    <DropdownMenuItem key={action.name} onClick={() => onAddAction(action.name)}>
                        <action.icon className="mr-2 h-4 w-4" />
                        <span>{action.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
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

  const handleAddAction = (type: string) => {
    if (currentStep) {
        const newAction: Action = {
            id: Date.now(),
            type,
            target: 'your-selector',
            value: ''
        };
        setCurrentStep({ ...currentStep, actions: [...currentStep.actions, newAction] });
    }
  };

  const handleActionDelete = (actionId: number) => {
    if (currentStep) {
        const newActions = currentStep.actions.filter(action => action.id !== actionId);
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
     <div className={cn(
        "absolute top-0 right-0 h-full transition-transform duration-300 ease-in-out w-96 z-10",
        selectedStep ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className={`bg-background border-l h-full flex flex-col`}>
            {currentStep && (
                <>
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
                                <ActionForm 
                                    key={action.id} 
                                    action={action} 
                                    onActionChange={handleActionChange} 
                                    onActionDelete={handleActionDelete}
                                />
                            ))}
                            <AddActionButton onAddAction={handleAddAction} />
                        </div>

                    </div>
                     <footer className="p-4 border-t mt-auto">
                        <Button className="w-full" onClick={handleSaveChanges}>Save Changes</Button>
                    </footer>
                </>
            )}
        </div>
    </div>
  );
}
