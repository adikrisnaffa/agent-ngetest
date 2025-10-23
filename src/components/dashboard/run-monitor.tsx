"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogEntry } from "./main-dashboard";
import { cn } from "@/lib/utils";
import { CheckCircle, Info, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";

const getStatusColor = (status: LogEntry['status']) => {
    switch (status) {
        case 'success':
            return 'text-green-400';
        case 'error':
            return 'text-red-400';
        case 'running':
            return 'text-blue-400';
        case 'info':
        default:
            return 'text-gray-400';
    }
}

const getStatusIcon = (status: LogEntry['status']) => {
    switch (status) {
        case 'success':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'error':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'running':
            return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
        case 'info':
        default:
            return <Info className="h-4 w-4 text-gray-500" />;
    }
}

export default function RunMonitor({ logs, isRunning }: { logs: LogEntry[], isRunning: boolean }) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="h-64 flex flex-col">
            <h3 className="text-lg font-semibold mb-2 px-1">Run Monitor</h3>
            <Card className="flex-1 bg-black/80 p-4 border-t rounded-lg shadow-inner">
                <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
                    <div className="font-mono text-sm text-white/90 space-y-2 pr-4">
                        {logs.map((log, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <span className="text-gray-500 flex-shrink-0">[{log.timestamp}]</span>
                                <span className={cn("font-bold uppercase w-20 flex-shrink-0 flex items-center gap-1.5", getStatusColor(log.status))}>
                                    {log.status}
                                </span>
                                <p className="flex-1 whitespace-pre-wrap break-words">
                                    {log.message}
                                </p>
                            </div>
                        ))}
                         {isRunning && logs.length > 0 && <div className="flex items-center gap-2 text-blue-400"><Loader2 className="h-4 w-4 animate-spin"/><span>Running...</span></div>}
                         {!isRunning && logs.length === 0 && <div className="text-gray-500">Run a flow to see the logs here.</div>}
                    </div>
                </ScrollArea>
            </Card>
        </div>
    )
}
