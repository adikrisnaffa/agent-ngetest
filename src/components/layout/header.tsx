
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
import placeholderImages from "@/lib/placeholder-images.json";
import type { GenerateTestInput } from "@/ai/flows/schemas";

const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');

interface HeaderProps {
    onRun: () => void;
    onExport: (target: GenerateTestInput['target']) => void;
    isExporting: boolean;
}

export default function Header({ onRun, onExport, isExporting }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold tracking-wider">Automation Aent</h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onRun}>
                <Play className="mr-2 h-4 w-4" />
                Run
            </Button>
            <Button variant="outline" disabled>
                <Square className="mr-2 h-4 w-4" />
                Stop
            </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileCode className="mr-2 h-4 w-4" />}
              <span>Export</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport('playwright')}>Playwright</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('cypress')}>Cypress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('selenium')}>Selenium</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar className="h-9 w-9">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

    
