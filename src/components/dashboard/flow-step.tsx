import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, MoreVertical, Trash2, Workflow } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FlowStepProps {
  id: number;
  title: string;
  actions: { type: string; detail: string }[];
  isSelected?: boolean;
}

const getActionClasses = (type: string) => {
    switch(type.toLowerCase()){
        case 'click': return 'text-primary font-semibold';
        case 'type': return 'text-foreground';
        case 'assert': return 'text-accent-foreground font-semibold bg-accent rounded-sm px-1';
        case 'navigate': return 'text-foreground font-semibold';
        default: return 'text-muted-foreground';
    }
}

export default function FlowStep({ title, actions, isSelected }: FlowStepProps) {
  return (
    <Card className={cn(
        "w-80 shadow-lg bg-card/80 backdrop-blur-sm border-border/60 hover:border-primary transition-colors group cursor-pointer",
        isSelected && "border-primary ring-2 ring-primary"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 border-b">
        <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary"/>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" className="cursor-grab h-7 w-7 opacity-60 group-hover:opacity-100">
                <GripVertical className="h-5 w-5" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-60 group-hover:opacity-100">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <span className={`font-mono text-xs w-20 flex-shrink-0 ${getActionClasses(action.type)}`}>{action.type}</span>
              <span className="text-muted-foreground leading-tight">{action.detail}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
