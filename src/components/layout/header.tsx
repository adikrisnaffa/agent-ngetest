
"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileCode, ChevronDown, User, Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
    onRun: () => void;
    onStop: () => void;
    isRunning: boolean;
}

export default function Header({ onRun, onStop, isRunning }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold tracking-wider">Agent Ngetest</h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onRun} disabled={isRunning}>
                {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Play className="mr-2 h-4 w-4" />}
                Run
            </Button>
            <Button variant="outline" onClick={onStop} disabled={!isRunning}>
                <Square className="mr-2 h-4 w-4" />
                Stop
            </Button>
        </div>
        
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
