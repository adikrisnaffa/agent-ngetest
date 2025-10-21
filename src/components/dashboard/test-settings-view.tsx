"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function TestSettingsView() {
    return (
        <div className="p-4 md:p-8 h-full overflow-auto">
             <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-0 -mx-4 md:-mx-0 mb-4">
                <h1 className="text-xl font-semibold tracking-wider">Test Settings</h1>
            </header>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Global Test Settings</CardTitle>
                        <CardDescription>These settings apply to all test runs unless overridden.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                            <Label htmlFor="browser">Default Browser</Label>
                             <Select defaultValue="chrome">
                                <SelectTrigger id="browser" className="w-[280px]">
                                    <SelectValue placeholder="Select a browser" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chrome">Google Chrome</SelectItem>
                                    <SelectItem value="firefox">Mozilla Firefox</SelectItem>
                                    <SelectItem value="safari">Apple Safari</SelectItem>
                                    <SelectItem value="edge">Microsoft Edge</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timeout">Default Timeout (ms)</Label>
                            <Input id="timeout" type="number" defaultValue={30000} className="w-[280px]" />
                            <p className="text-sm text-muted-foreground">Max time to wait for an element to appear.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="resolution">Screen Resolution</Label>
                            <Select defaultValue="1920x1080">
                                <SelectTrigger id="resolution" className="w-[280px]">
                                    <SelectValue placeholder="Select a resolution" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1920x1080">1920x1080 (Desktop)</SelectItem>
                                    <SelectItem value="1366x768">1366x768 (Laptop)</SelectItem>
                                    <SelectItem value="375x812">375x812 (Mobile)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch id="headless-mode" defaultChecked/>
                            <Label htmlFor="headless-mode">Run in Headless Mode</Label>
                        </div>
                         <div className="flex justify-end">
                            <Button>Save Settings</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
