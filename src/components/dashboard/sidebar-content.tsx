import {
  SidebarHeader,
  SidebarContent as SidebarBody,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bot, Settings, KeyRound, Workflow, ScanLine, FolderGit2, TestTube, ChevronsRight, AreaChart } from "lucide-react";

interface SidebarContentProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function SidebarContent({ activeView, setActiveView }: SidebarContentProps) {
  const navItems = [
    { name: "Configuration", icon: Settings },
    { name: "Authentication", icon: KeyRound },
    { name: "Flow Builder", icon: Workflow },
    { name: "Scan Config", icon: ScanLine },
    { name: "Repository", icon: FolderGit2 },
    { name: "Test Settings", icon: TestTube },
    { name: "Reporting", icon: AreaChart },
  ];

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader className="p-4 border-b">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold tracking-wider group-data-[collapsible=icon]:hidden">Agent Ngetest</h1>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 group-data-[collapsible=icon]:hidden">
                <ChevronsRight className="h-5 w-5" />
            </Button>
         </div>
      </SidebarHeader>
      <SidebarBody>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                tooltip={item.name} 
                isActive={activeView === item.name}
                onClick={() => setActiveView(item.name)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarBody>
      <SidebarFooter className="mt-auto border-t p-4">
         <div className="text-center text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            © Tukang Ngetest {new Date().getFullYear()}
        </div>
      </SidebarFooter>
    </div>
  );
}
