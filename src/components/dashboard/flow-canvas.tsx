"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil } from "lucide-react";
import FlowStep from "./flow-step";
import React, { useState } from "react";
import { Card } from "../ui/card";
import type { Step } from "./main-dashboard";
import { cn } from "@/lib/utils";

interface FlowCanvasProps {
    steps: Step[];
    onStepSelect: (step: Step) => void;
    selectedStepId: number | null;
    onAddStep: (type: string) => void;
    onDeleteStep: (id: number) => void;
    onMoveStep: (draggedId: number, targetId: number) => void;
}

const DropZone = ({ onDrop }: { onDrop: () => void }) => {
    const [isOver, setIsOver] = useState(false);
    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsOver(true);
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsOver(false);
                onDrop();
            }}
            className={cn(
                "w-16 h-20 transition-all",
                isOver ? "bg-primary/20 scale-y-150" : "bg-border/20",
                "rounded-full"
            )}
        />
    )
}

export default function FlowCanvas({ steps, onStepSelect, selectedStepId, onAddStep, onDeleteStep, onMoveStep }: FlowCanvasProps) {
  
  const handleDropOnCanvas = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/reactflow");
    if (typeof type === "undefined" || !type) {
      return;
    }
    // This handles adding new steps from palette
    onAddStep(type);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only allow drop if it's a new node from the palette
    if (e.dataTransfer.types.includes("application/reactflow")) {
        e.dataTransfer.dropEffect = 'move';
    } else {
        e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleStepDrop = (targetId: number) => {
    const draggedId = parseInt(localStorage.getItem('draggedStepId') || '0', 10);
    if (draggedId && draggedId !== targetId) {
        onMoveStep(draggedId, targetId);
    }
  }
  
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
        onDrop={handleDropOnCanvas}
        onDragOver={handleDragOver}
      >
        {steps.length === 0 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground">
             <p className="text-lg font-medium">Your flow is empty</p>
             <p>Drag & drop actions from the node palette to build your test case.</p>
           </div>
        ) : (
          <div className="absolute inset-0 overflow-auto p-8">
            <div className="flex items-center gap-2">
                <Card 
                    className="p-4 bg-background border-primary border-2 shadow-lg"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleStepDrop(0)}
                >
                    <p className="text-lg font-semibold flex items-center gap-2"><ArrowRight className="text-primary"/> Start</p>
                </Card>
              {steps.map((step) => (
                <React.Fragment key={step.id}>
                    <div className="flex items-center gap-2">
                        <DropZone onDrop={() => handleStepDrop(step.id)} />
                        <div 
                            onClick={() => onStepSelect(step)} 
                            draggable 
                            onDragStart={() => localStorage.setItem('draggedStepId', String(step.id))}
                            onDragEnd={() => localStorage.removeItem('draggedStepId')}
                        >
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
