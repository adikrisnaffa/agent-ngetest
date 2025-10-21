"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil } from "lucide-react";
import FlowStep from "./flow-step";
import React from "react";
import { Card } from "../ui/card";
import type { Step } from "./main-dashboard";

interface FlowCanvasProps {
    steps: Step[];
    onStepSelect: (step: Step) => void;
    selectedStepId: number | null;
    onAddStep: (type: string) => void;
    onDeleteStep: (id: number) => void;
}

export default function FlowCanvas({ steps, onStepSelect, selectedStepId, onAddStep, onDeleteStep }: FlowCanvasProps) {
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/reactflow");
    if (typeof type === "undefined" || !type) {
      return;
    }
    onAddStep(type);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Untitled Flow</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className="relative flex-1 rounded-lg dot-grid border"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {steps.length === 0 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground">
             <p className="text-lg font-medium">Your flow is empty</p>
             <p>Drag & drop actions from the node palette to build your test case.</p>
           </div>
        ) : (
          <div className="absolute inset-0 overflow-auto p-8">
            <div className="flex items-center gap-8">
                <Card className="p-4 bg-background border-primary border-2 shadow-lg">
                    <p className="text-lg font-semibold flex items-center gap-2"><ArrowRight className="text-primary"/> Start</p>
                </Card>
              {steps.map((step) => (
                <React.Fragment key={step.id}>
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-1 bg-border rounded-full" />
                        <div onClick={() => onStepSelect(step)}>
                            <FlowStep {...step} isSelected={selectedStepId === step.id} onDelete={onDeleteStep} />
                        </div>
                    </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
