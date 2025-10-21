"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ActionCardProps {
  name: string;
  icon: LucideIcon;
  description: string;
}

export default function ActionCard({ name, icon: Icon, description }: ActionCardProps) {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/reactflow", name);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <Card 
      draggable
      onDragStart={handleDragStart}
      className="cursor-move hover:bg-card/60 hover:border-primary transition-colors group bg-transparent">
      <CardContent className="p-3 flex flex-col items-center justify-center text-center">
        <Icon className="h-6 w-6 mb-2 text-primary" />
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
