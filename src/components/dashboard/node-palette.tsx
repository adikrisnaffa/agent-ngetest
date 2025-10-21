import ActionCard from "./action-card";
import { MousePointerClick, Type, Search, Forward } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NodePalette() {
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
        <ScrollArea className="flex-1">
          <div className="p-4">
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
