"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const projects = [
    { id: 1, name: "Project Alpha - E-commerce Checkout", status: "Ready for Testing" },
    { id: 2, name: "Project Bravo - User Authentication", status: "Deploy" },
    { id: 3, name: "Project Charlie - API Integration", status: "Bug" },
    { id: 4, name: "Project Delta - Reporting Dashboard", status: "Development" },
    { id: 5, name: "Project Echo - Mobile App Refactor", status: "Testing" },
    { id: 6, name: "Project Foxtrot - New Landing Page", status: "Ready to Prod" },
    { id: 7, name: "Project Golf - Database Migration", status: "Development" },
];

type Status = "Development" | "Ready for Testing" | "Bug" | "Testing" | "Ready to Prod" | "Deploy";

const getStatusBadgeVariant = (status: Status) => {
    switch (status) {
        case "Development":
            return "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30";
        case "Ready for Testing":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30";
        case "Bug":
            return "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30";
        case "Testing":
            return "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30";
        case "Ready to Prod":
            return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30";
        case "Deploy":
            return "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30";
        default:
            return "secondary";
    }
};

export default function ReportingView() {
    return (
        <div className="p-4 md:p-8 h-full overflow-auto">
             <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-0 -mx-4 md:-mx-0 mb-4">
                <h1 className="text-xl font-semibold tracking-wider">Reporting</h1>
            </header>
            <div className="max-w-6xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Status Overview</CardTitle>
                        <CardDescription>Track the current status of all ongoing test automation projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead className="w-[200px] text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium text-muted-foreground">PROJ-{project.id.toString().padStart(3, '0')}</TableCell>
                                        <TableCell className="font-semibold">{project.name}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={cn("text-xs font-bold py-1 px-3 rounded-full", getStatusBadgeVariant(project.status as Status))}>
                                                {project.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
