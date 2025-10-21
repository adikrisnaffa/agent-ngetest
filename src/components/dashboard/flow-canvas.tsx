import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil } from "lucide-react";
import FlowStep from "./flow-step";
import React from "react";
import { Card } from "../ui/card";

export default function FlowCanvas() {
  const steps = [
    {
      id: 1,
      title: "User Login",
      actions: [
        { type: "Navigate", detail: "to /login" },
        { type: "Type", detail: "'testuser' in Username" },
        { type: "Type", detail: "'password' in Password" },
        { type: "Click", detail: "Login Button" },
      ],
    },
    {
      id: 2,
      title: "Assert Login",
      actions: [
        { type: "Assert", detail: "URL is /dashboard" },
        { type: "Assert", detail: "Welcome message is visible"},
      ],
    },
    {
      id: 3,
      title: "Add Product",
      actions: [
        { type: "Click", detail: "Product 'Automation'" },
        { type: "Click", detail: "Add to Cart Button" },
        { type: "Assert", detail: "Cart count is 1" },
      ],
    },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Untitled Flow</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative flex-1 rounded-lg dot-grid border">
        {steps.length === 0 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground">
             <p className="text-lg font-medium">Your flow is empty</p>
             <p>Drag & drop actions from the node palette to build your test case.</p>
           </div>
        ) : (
          <div className="absolute inset-0 overflow-auto p-8">
            <div className="flex items-center gap-8">
                <Card className="p-4 bg-background border-primary border-2 shadow-lg">
                    <p className="text-lg font-semibold flex items-center gap-2"><ArrowRight className="text-primary"/> Start</p>
                </Card>
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-1 bg-border rounded-full" />
                        <FlowStep {...step} />
                    </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
