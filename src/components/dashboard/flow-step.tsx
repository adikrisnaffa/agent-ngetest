import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";

interface FlowStepProps {
  id: number;
  title: string;
  actions: { type: string; detail: string }[];
}

const getActionClasses = (type: string) => {
    switch(type.toLowerCase()){
        case 'click': return 'text-primary font-semibold';
        case 'type': return 'text-foreground';
        case 'assert': return 'text-accent font-semibold';
        case 'navigate': return 'text-foreground font-semibold';
        default: return 'text-muted-foreground';
    }
}

export default function FlowStep({ title, actions }: FlowStepProps) {
  return (
    <Card className="w-full max-w-2xl shadow-lg bg-card/80 border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="cursor-grab h-8 w-8">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 pl-10 pt-2">
          {actions.map((action, index) => (
            <div key={index} className="flex items-center gap-4 text-sm">
              <span className={`font-mono w-20 flex-shrink-0 ${getActionClasses(action.type)}`}>{action.type}</span>
              <span className="text-muted-foreground">{action.detail}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
