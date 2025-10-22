"use client";

import ActionCard from "./action-card";
import { MousePointerClick, Type, Search, Forward, Plus, FilePlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface NodePaletteProps {
  onAddNode: (type: string) => void;
  onCreateFlow: () => void;
}

export function NodePalette({ onAddNode, onCreateFlow }: NodePaletteProps) {
  const actions = [
    { name: "Click", icon: MousePointerClick, description: "Click an element" },
    { name: "Type", icon: Type, description: "Type some text" },
    { name: "Assert", icon: Search, description: "Assert an element" },
    { name: "Navigate", icon: Forward, description: "Go to a URL" },
  ];

  return (
    <aside className="hidden md:block w-72 border-l border-r bg-background">
      <div className="flex flex-col h-full">
        <header className="p-4 border-b">
          <h2 className="text-lg font-semibold">Node Palette</h2>
        </header>
        <div className="p-4 space-y-4">
            <Button className="w-full" onClick={onCreateFlow}>
                <FilePlus className="mr-2 h-4 w-4" />
                Create Flow
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Node
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {actions.map((action) => (
                  <DropdownMenuItem key={action.name} onClick={() => onAddNode(action.name)}>
                    <action.icon className="mr-2 h-4 w-4"/>
                    <span>{action.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Drag to add</h3>
            <div className="grid grid-cols-2 gap-3">
              {actions.map((action) => (
                <ActionCard key={action.name} {...action} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

export default NodePalette;
