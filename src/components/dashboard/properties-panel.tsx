"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Workflow } from "lucide-react";
import type { Step } from "./main-dashboard";

interface PropertiesPanelProps {
  selectedStep: Step | null;
  onClose: () => void;
}

function renderConfigForStep(step: Step) {
    if (step.type.toLowerCase() === 'group') {
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="step-name">Step Name</Label>
                    <Input id="step-name" defaultValue={step.title} />
                </div>
                <p className="text-sm text-muted-foreground">This is a group of actions. Configuration for individual actions will be available soon.</p>
            </div>
        )
    }

    // Example for a single action node
    return (
        <div className="space-y-4">
             <div>
                <Label htmlFor="node-type">Node Type</Label>
                <Input id="node-type" value={step.type} disabled />
            </div>
            <div>
                <Label htmlFor="node-details">Details</Label>
                <Input id="node-details" defaultValue={step.actions[0]?.detail || ''} />
            </div>
        </div>
    )
}

export default function PropertiesPanel({ selectedStep, onClose }: PropertiesPanelProps) {
  return (
    <div className={`transition-all duration-300 ease-in-out ${selectedStep ? 'w-96 ml-8' : 'w-0'}`}>
        <div className={`bg-background border-l h-full ${selectedStep ? 'block' : 'hidden'} overflow-hidden rounded-lg`}>
            {selectedStep && (
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
                        {renderConfigForStep(selectedStep)}
                    </div>
                     <footer className="p-4 border-t mt-auto">
                        <Button className="w-full">Save Changes</Button>
                    </footer>
                </div>
            )}
        </div>
    </div>
  );
}
