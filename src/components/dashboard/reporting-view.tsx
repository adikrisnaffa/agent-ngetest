"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

type Status = "Development" | "Ready for Testing" | "Bug" | "Testing" | "Ready to Prod" | "Deploy";

interface Project {
    id: number;
    name: string;
    status: Status;
}

const initialProjects: Project[] = [
    { id: 1, name: "Project Alpha - E-commerce Checkout", status: "Ready for Testing" },
    { id: 2, name: "Project Bravo - User Authentication", status: "Deploy" },
    { id: 3, name: "Project Charlie - API Integration", status: "Bug" },
    { id: 4, name: "Project Delta - Reporting Dashboard", status: "Development" },
    { id: 5, name: "Project Echo - Mobile App Refactor", status: "Testing" },
    { id: 6, name: "Project Foxtrot - New Landing Page", status: "Ready to Prod" },
    { id: 7, name: "Project Golf - Database Migration", status: "Development" },
];

const ALL_STATUSES: Status[] = ["Development", "Ready for Testing", "Bug", "Testing", "Ready to Prod", "Deploy"];

const getStatusBadgeVariant = (status: Status) => {
    switch (status) {
        case "Development": return "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30";
        case "Ready for Testing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30";
        case "Bug": return "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30";
        case "Testing": return "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30";
        case "Ready to Prod": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30";
        case "Deploy": return "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30";
        default: return "secondary";
    }
};

function ProjectFormDialog({
    isOpen,
    onOpenChange,
    project,
    onSave,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    project: Omit<Project, 'status' | 'id'> & { id?: number } | null;
    onSave: (name: string) => void;
}) {
    const [name, setName] = useState("");

    React.useEffect(() => {
        if (project) {
            setName(project.name);
        } else {
            setName("");
        }
    }, [project, isOpen]);

    const handleSubmit = () => {
        if (name.trim()) {
            onSave(name.trim());
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                        id="project-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter project name"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Project</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function ReportingView() {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);


    const handleAddProject = () => {
        setEditingProject(null);
        setIsDialogOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setIsDialogOpen(true);
    };

    const confirmDeleteProject = (project: Project) => {
        setProjectToDelete(project);
        setIsDeleteAlertOpen(true);
    };

    const handleDeleteProject = () => {
        if (projectToDelete) {
            setProjects(projects.filter(p => p.id !== projectToDelete.id));
            setProjectToDelete(null);
        }
         setIsDeleteAlertOpen(false);
    };

    const handleSaveProject = (name: string) => {
        if (editingProject) {
            setProjects(projects.map(p => p.id === editingProject.id ? { ...p, name } : p));
        } else {
            const newProject: Project = {
                id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
                name,
                status: "Development",
            };
            setProjects([...projects, newProject]);
        }
    };

    const handleStatusChange = (projectId: number, newStatus: Status) => {
        setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    };

    return (
        <div className="p-4 md:p-8 h-full overflow-auto">
             <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-0 -mx-4 md:-mx-0 mb-4">
                <h1 className="text-xl font-semibold tracking-wider">Reporting</h1>
            </header>
            <div className="max-w-6xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Project Status Overview</CardTitle>
                            <CardDescription>Track the current status of all ongoing test automation projects.</CardDescription>
                        </div>
                        <Button onClick={handleAddProject}>
                            <Plus className="mr-2"/>
                            Add Project
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead className="w-[200px] text-center">Status</TableHead>
                                    <TableHead className="w-[50px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium text-muted-foreground">PROJ-{project.id.toString().padStart(3, '0')}</TableCell>
                                        <TableCell className="font-semibold">{project.name}</TableCell>
                                        <TableCell className="text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className={cn("text-xs font-bold py-1 px-3 rounded-full w-40", getStatusBadgeVariant(project.status))}>
                                                        {project.status}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="center">
                                                    {ALL_STATUSES.map(status => (
                                                        <DropdownMenuItem key={status} onSelect={() => handleStatusChange(project.id, status)}>
                                                            {status}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditProject(project)}>
                                                        <Pencil className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => confirmDeleteProject(project)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <ProjectFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                project={editingProject}
                onSave={handleSaveProject}
            />
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project from the list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProject}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
