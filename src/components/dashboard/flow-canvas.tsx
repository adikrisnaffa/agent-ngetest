import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import FlowStep from "./flow-step";
import React from "react";

export default function FlowCanvas() {
  const steps = [
    {
      id: 1,
      title: "User Login",
      actions: [
        { type: "Navigate", detail: "to /login" },
        { type: "Type", detail: "'testuser' in Username Input" },
        { type: "Type", detail: "'password' in Password Input" },
        { type: "Click", detail: "Login Button" },
        { type: "Assert", detail: "URL is /dashboard" },
      ],
    },
    {
      id: 2,
      title: "Add Product to Cart",
      actions: [
        { type: "Click", detail: "Product 'Automation Suite'" },
        { type: "Click", detail: "Add to Cart Button" },
        { type: "Assert", detail: "Cart count is 1" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Untitled Flow</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative border-2 border-dashed border-border rounded-lg p-8 min-h-[70vh]">
        {steps.length === 0 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground">
             <p className="text-lg font-medium">Your flow is empty</p>
             <p>Drag & drop actions from the node palette to build your test case.</p>
           </div>
        ) : (
          <div className="flex flex-col items-center gap-8 pt-8">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <FlowStep {...step} />
                {index < steps.length - 1 && (
                    <div className="w-px h-8 bg-border"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
