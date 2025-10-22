
"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil, Check } from "lucide-react";
import FlowStep from "./flow-step";
import React, { useState, useRef, useEffect } from "react";
import { Card } from "../ui/card";
import type { Step } from "./main-dashboard";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

interface FlowCanvasProps {
    steps: Step[];
    onStepSelect: (step: Step) => void;
    selectedStepId: number | null;
    onAddStep: (type: string) => void;
    onDeleteStep: (id: number) => void;
    onMoveStep: (draggedId: number, targetId: number) => void;
    flowTitle: string;
    onTitleChange: (newTitle: string) => void;
}

const DropZone = ({ onDrop }: { onDrop: () => void }) => {
    const [isOver, setIsOver] = useState(false);
    return (
        <div 
            className="relative h-20 w-8 flex items-center justify-center"
            onDragOver={(e) => {
                e.preventDefault();
                setIsOver(true);
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOver(false);
                onDrop();
            }}
        >
            <div className={cn(
                "h-0.5 w-full bg-border transition-colors",
                isOver && "bg-primary"
            )}/>
            <div className={cn(
                "absolute h-12 w-12 rounded-full transition-all",
                isOver && "bg-primary/20 scale-150"
            )}/>
        </div>
    )
}

const FlowTitle = ({ title, onTitleChange }: { title: string, onTitleChange: (newTitle: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    
    const handleSave = () => {
        if (currentTitle.trim()) {
            onTitleChange(currentTitle.trim());
        } else {
            setCurrentTitle(title); // Revert if empty
        }
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    ref={inputRef}
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') {
                            setCurrentTitle(title);
                            setIsEditing(false);
                        }
                    }}
                    className="text-2xl font-bold tracking-tight h-10 w-80"
                />
                 <Button onClick={handleSave} size="icon" className="h-9 w-9">
                    <Check className="h-5 w-5"/>
                </Button>
            </div>
        )
    }

    return (
         <div className="flex items-center gap-3 group">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                onClick={() => setIsEditing(true)}
            >
                <Pencil className="h-4 w-4" />
            </Button>
        </div>
    )
}


export default function FlowCanvas({ steps, onStepSelect, selectedStepId, onAddStep, onDeleteStep, onMoveStep, flowTitle, onTitleChange }: FlowCanvasProps) {
  
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
        <FlowTitle title={flowTitle} onTitleChange={onTitleChange} />
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
                <div 
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleStepDrop(0);
                  }}
                >
                  <Card className="p-4 bg-background border-primary border-2 shadow-lg">
                      <p className="text-lg font-semibold flex items-center gap-2"><ArrowRight className="text-primary"/> Start</p>
                  </Card>
                </div>

              {steps.map((step) => (
                <React.Fragment key={step.id}>
                    <div className="flex items-center gap-2">
                        <div className="w-full h-full" onDragOver={(e) => e.preventDefault()} onDrop={() => handleStepDrop(step.id)} >
                            <div className="w-20 h-px bg-gray-500"/>
                        </div>
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

    