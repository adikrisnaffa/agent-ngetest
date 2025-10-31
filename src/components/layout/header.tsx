
"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileCode, ChevronDown, User, Play, Square, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

interface HeaderProps {
    onRun: () => void;
    onStop: () => void;
    isRunning: boolean;
}

export default function Header({ onRun, onStop, isRunning }: HeaderProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

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
        
        {isUserLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : user ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ""} />
                        <AvatarFallback>
                            {user.email?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        <p className="font-medium">My Account</p>
                        <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2"/>
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ) : (
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
        )}
      </div>
    </header>
  );
}
