import {
  SidebarHeader,
  SidebarContent as SidebarBody,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ActionCard from "./action-card";
import { Bot, Plus, Settings, LifeBuoy, MousePointerClick, Type, Search, Forward } from "lucide-react";

export default function SidebarContent() {
  const actions = [
    { name: "Click", icon: MousePointerClick, description: "Click an element" },
    { name: "Type", icon: Type, description: "Type some text" },
    { name: "Assert", icon: Search, description: "Assert an element" },
    { name: "Navigate", icon: Forward, description: "Go to a URL" },
  ];

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader className="p-4 border-b">
         <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold tracking-wider">Aent</h1>
         </div>
      </SidebarHeader>
      <SidebarBody className="p-0">
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <div className="px-4 py-2">
              <AccordionTrigger className="py-2 hover:no-underline">
                <h3 className="font-semibold text-base">Object Repository</h3>
              </AccordionTrigger>
            </div>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Object
                </Button>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between items-center rounded-md p-2 hover:bg-muted/50 transition-colors">
                    <span>Login Button</span>
                    <Badge variant="secondary">button</Badge>
                  </div>
                  <div className="flex justify-between items-center rounded-md p-2 hover:bg-muted/50 transition-colors">
                    <span>Username Input</span>
                    <Badge variant="secondary">input</Badge>
                  </div>
                  <div className="flex justify-between items-center rounded-md p-2 hover:bg-muted/50 transition-colors">
                    <span>Add to Cart</span>
                    <Badge variant="secondary">button</Badge>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-b-0">
            <div className="px-4 py-2">
                <AccordionTrigger className="py-2 hover:no-underline">
                    <h3 className="font-semibold text-base">Actions</h3>
                </AccordionTrigger>
            </div>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => (
                  <ActionCard key={action.name} {...action} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SidebarBody>
      <SidebarFooter className="mt-auto border-t p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
              <LifeBuoy className="h-4 w-4" />
              <span>Help & Support</span>
          </Button>
      </SidebarFooter>
    </div>
  );
}
