
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clipboard, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CodeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  code: string;
  isLoading: boolean;
}

// Basic syntax highlighting for demonstration
const SyntaxHighlighter = ({ code }: { code: string }) => {
    const highlight = (text: string) => {
        return text
            .replace(/\b(const|let|var|async|await|import|from|export|default|function|return|new)\b/g, '<span class="text-primary font-semibold">$1</span>')
            .replace(/\b(describe|it|test|expect|page)\b/g, '<span class="text-purple-400">$1</span>')
            .replace(/('.*?')/g, '<span class="text-green-400">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>');
    };

    return (
        <pre className="text-sm">
            <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
        </pre>
    );
};

export default function CodeDialog({ isOpen, onOpenChange, code, isLoading }: CodeDialogProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({
        title: "Copied to Clipboard",
        description: "The generated test script has been copied.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Exported Test Script</DialogTitle>
          <DialogDescription>
            Here is the generated code. You can copy it to your clipboard.
          </DialogDescription>
        </DialogHeader>
        <div className="relative flex-1 bg-muted/50 rounded-lg border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="font-medium">Generating Code...</p>
                <p className="text-sm">The AI is writing your test script. Please wait.</p>
              </div>
            </div>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleCopy}
              >
                {hasCopied ? <Check className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
              </Button>
              <ScrollArea className="h-full w-full">
                <div className="p-4 font-mono">
                    <SyntaxHighlighter code={code} />
                </div>
              </ScrollArea>
            </>
          )}
        </div>
         <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    