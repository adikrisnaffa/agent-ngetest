"use client";

import React, { useState } from "react";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import {
    useCollection,
    useFirebase,
    useUser,
    addDocumentNonBlocking,
    updateDocumentNonBlocking,
    deleteDocumentNonBlocking,
    useMemoFirebase,
    type WithId
} from "@/firebase";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

type Status = "Development" | "Ready for Testing" | "Bug" | "Testing" | "Ready to Prod" | "Deploy";

interface Project {
    name: string;
    status: Status;
    createdAt: any; // Firestore timestamp
}

type ProjectWithId = WithId<Project>;

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
    project: Omit<Project, 'status' | 'createdAt' > & { id?: string } | null;
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
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    
    const projectsCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/projects`);
    }, [user, firestore]);
    
    const { data: projects, isLoading: areProjectsLoading } = useCollection<Project>(projectsCollectionRef);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectWithId | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<ProjectWithId | null>(null);


    const handleAddProject = () => {
        setEditingProject(null);
        setIsDialogOpen(true);
    };

    const handleEditProject = (project: ProjectWithId) => {
        setEditingProject(project);
        setIsDialogOpen(true);
    };

    const confirmDeleteProject = (project: ProjectWithId) => {
        setProjectToDelete(project);
        setIsDeleteAlertOpen(true);
    };

    const handleDeleteProject = () => {
        if (projectToDelete && projectsCollectionRef) {
            const projectDocRef = doc(projectsCollectionRef, projectToDelete.id);
            deleteDocumentNonBlocking(projectDocRef);
            setProjectToDelete(null);
        }
        setIsDeleteAlertOpen(false);
    };

    const handleSaveProject = (name: string) => {
        if (!projectsCollectionRef) return;

        if (editingProject) {
            const projectDocRef = doc(projectsCollectionRef, editingProject.id);
            updateDocumentNonBlocking(projectDocRef, { name });
        } else {
            const newProject: Project = {
                name,
                status: "Development",
                createdAt: serverTimestamp(),
            };
            addDocumentNonBlocking(projectsCollectionRef, newProject);
        }
    };

    const handleStatusChange = (projectId: string, newStatus: Status) => {
        if (projectsCollectionRef) {
            const projectDocRef = doc(projectsCollectionRef, projectId);
            updateDocumentNonBlocking(projectDocRef, { status: newStatus });
        }
    };
    
    const sortedProjects = React.useMemo(() => {
        if (!projects) return [];
        return [...projects].sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
    }, [projects]);

    const getProjectNumericId = (project: ProjectWithId, index: number) => {
        // Fallback for older data that might not have a numeric prefix
        return (index + 1).toString().padStart(3, '0');
    }

    if (isUserLoading) {
         return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    if (!user) {
        return (
             <div className="p-4 md:p-8 h-full overflow-auto">
                <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-0 -mx-4 md:-mx-0 mb-4">
                    <h1 className="text-xl font-semibold tracking-wider">Reporting</h1>
                </header>
                <div className="max-w-6xl mx-auto text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Access Denied</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p>You must be logged in to view and manage projects.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

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
                                {areProjectsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : sortedProjects.length > 0 ? (
                                    sortedProjects.map((project, index) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium text-muted-foreground">PROJ-{getProjectNumericId(project, index)}</TableCell>
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
                                ))) : (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No projects found. Click "Add Project" to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
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
                            This action cannot be undone. This will permanently delete the project from your database.
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
