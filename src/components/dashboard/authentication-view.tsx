"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function AuthenticationView() {
    return (
        <div className="p-4 md:p-8 h-full overflow-auto">
             <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-0 -mx-4 md:-mx-0 mb-4">
                <h1 className="text-xl font-semibold tracking-wider">Authentication</h1>
            </header>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Authentication Profiles</CardTitle>
                            <CardDescription>Manage saved credentials for your tests.</CardDescription>
                        </div>
                        <Button>
                            <Plus className="mr-2"/>
                            Add Profile
                        </Button>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg">
                            <div>
                                <Label htmlFor="profile-name">Profile Name</Label>
                                <Input id="profile-name" placeholder="e.g., Admin User" defaultValue="Admin User" />
                            </div>
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" placeholder="Enter username" defaultValue="admin@example.com"/>
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="Enter password" defaultValue="password123"/>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-muted/20">
                            <div>
                                <Label htmlFor="profile-name-2">Profile Name</Label>
                                <Input id="profile-name-2" placeholder="e.g., Regular User" />
                            </div>
                            <div>
                                <Label htmlFor="username-2">Username</Label>
                                <Input id="username-2" placeholder="Enter username" />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="password-2">Password</Label>
                                <Input id="password-2" type="password" placeholder="Enter password" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
