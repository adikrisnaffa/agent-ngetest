"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function ScanConfigView() {
    return (
        <div className="p-4 md:p-8 h-full overflow-auto">
             <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-0 -mx-4 md:-mx-0 mb-4">
                <h1 className="text-xl font-semibold tracking-wider">Scan Configuration</h1>
            </header>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Default Scan Settings</CardTitle>
                        <CardDescription>Configure the default parameters for running test flows.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="target-url">Target URL</Label>
                            <Input id="target-url" placeholder="https://example.com" defaultValue="https://your-app.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="schedule">Run Schedule</Label>
                             <Select>
                                <SelectTrigger id="schedule">
                                    <SelectValue placeholder="Select a schedule" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual (On-demand)</SelectItem>
                                    <SelectItem value="daily">Daily at midnight</SelectItem>
                                    <SelectItem value="hourly">Every hour</SelectItem>
                                    <SelectItem value="on-commit">On every code commit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notifications">Email Notifications</Label>
                            <Input id="notifications" type="email" placeholder="notify@example.com" defaultValue="qa-team@your-company.com" />
                            <p className="text-sm text-muted-foreground">Send reports to this email on failure.</p>
                        </div>
                         <div className="flex justify-end">
                            <Button>Save Configuration</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
