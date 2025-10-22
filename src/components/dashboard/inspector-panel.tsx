
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, Loader2, MousePointer, RefreshCw, Zap } from "lucide-react";

interface InspectorPanelProps {
    url: string;
    onUrlChange: (url: string) => void;
    onLoad: (url: string) => void;
    isLoading: boolean;
    isInspectorActive: boolean;
    onToggleInspector: () => void;
    selector: string;
    onCreateStep: (selector: string) => void;
}

export default function InspectorPanel({
    url,
    onUrlChange,
    onLoad,
    isLoading,
    isInspectorActive,
    onToggleInspector,
    selector,
    onCreateStep
}: InspectorPanelProps) {
    return (
        <div className="flex-shrink-0 space-y-4">
            <div className="flex items-center gap-2">
                <Input 
                    placeholder="https://example.com" 
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onLoad(url)}
                    disabled={isLoading}
                />
                <Button onClick={() => onLoad(url)} disabled={isLoading} className="w-40">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                    Load Page
                </Button>
                <Button variant="outline" size="icon" onClick={() => onLoad(url)} disabled={isLoading}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                 <div className="flex items-center space-x-3">
                    <Switch id="inspector-mode" checked={isInspectorActive} onCheckedChange={onToggleInspector} disabled={!url || isLoading} />
                    <Label htmlFor="inspector-mode" className="flex items-center gap-2 cursor-pointer">
                        <MousePointer className="h-5 w-5" />
                        Inspector Mode
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <Input readOnly placeholder="Click an element to get its selector" value={selector} className="w-80 bg-background" />
                    <Button variant="secondary" disabled={!selector} onClick={() => onCreateStep(selector)}>
                        <Zap className="mr-2"/>
                        Create Step
                    </Button>
                </div>
            </div>
        </div>
    )
}
