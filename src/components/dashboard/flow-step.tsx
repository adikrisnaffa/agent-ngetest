import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, MoreVertical, Trash2, Workflow, CheckCircle, XCircle, Loader } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Step } from './main-dashboard';


const getActionClasses = (type: string) => {
    switch(type.toLowerCase()){
        case 'click': return 'text-primary font-semibold';
        case 'type': return 'text-foreground';
        case 'assert': return 'text-accent-foreground font-semibold bg-accent rounded-sm px-1';
        case 'navigate': return 'text-foreground font-semibold';
        default: return 'text-muted-foreground';
    }
}

const getStatusIcon = (status: Step['status']) => {
    switch(status) {
        case 'running': return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
        case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'error': return <XCircle className="h-5 w-5 text-destructive" />;
        default: return <Workflow className="h-5 w-5 text-primary"/>;
    }
}

const getStatusClasses = (status: Step['status'], isSelected: boolean | undefined) => {
    if (isSelected) return "border-primary ring-2 ring-primary/50 shadow-primary/20";
    switch(status) {
        case 'running': return "border-blue-500 ring-2 ring-blue-500/50 shadow-blue-500/20";
        case 'success': return "border-green-500 ring-1 ring-green-500/50 shadow-green-500/10";
        case 'error': return "border-destructive ring-1 ring-destructive/50 shadow-destructive/10";
        default: return "border-border/60 hover:border-primary";
    }
}

interface FlowStepProps extends Step {
  isSelected?: boolean;
  onDelete: (id: number) => void;
}


export default function FlowStep({ title, actions, isSelected, status = 'idle', id, onDelete }: FlowStepProps) {
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the step from being selected when deleting
    onDelete(id);
  }
  
  return (
    <Card className={cn(
        "w-80 shadow-lg bg-card/80 backdrop-blur-sm transition-all duration-300 group cursor-pointer",
        getStatusClasses(status, isSelected)
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 border-b">
        <div className="flex items-center gap-2">
            {getStatusIcon(status)}
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" className="cursor-grab h-7 w-7 opacity-60 group-hover:opacity-100">
                <GripVertical className="h-5 w-5" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-60 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
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
              <span className="text-muted-foreground leading-tight truncate">{action.value ? `'${action.value}' in ` : ''}{action.target}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
