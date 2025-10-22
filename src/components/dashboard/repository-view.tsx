"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import ElementFormDialog from "./element-form-dialog";

export interface UIElement {
    id: number;
    name: string;
    selector: string;
}

export default function RepositoryView() {
    const [elements, setElements] = useState<UIElement[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingElement, setEditingElement] = useState<UIElement | null>(null);

    const handleAddElement = () => {
        setEditingElement(null);
        setIsDialogOpen(true);
    };

    const handleEditElement = (element: UIElement) => {
        setEditingElement(element);
        setIsDialogOpen(true);
    };

    const handleDeleteElement = (id: number) => {
        setElements(elements.filter(el => el.id !== id));
    };

    const handleSaveElement = (element: UIElement) => {
        if (editingElement) {
            setElements(elements.map(el => el.id === element.id ? element : el));
        } else {
            setElements([...elements, { ...element, id: Date.now() }]);
        }
    };

    return (
        <div className="p-4 md:p-8 h-full overflow-auto">
             <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-0 -mx-4 md:-mx-0 mb-4">
                <h1 className="text-xl font-semibold tracking-wider">Repository</h1>
            </header>
            <div className="max-w-6xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Object Repository</CardTitle>
                            <CardDescription>Manage reusable UI elements for your test flows.</CardDescription>
                        </div>
                        <Button onClick={handleAddElement}>
                            <Plus className="mr-2"/>
                            Add Element
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Element Name</TableHead>
                                    <TableHead>Selector</TableHead>
                                    <TableHead className="w-[50px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {elements.length > 0 ? (
                                    elements.map((element) => (
                                    <TableRow key={element.id}>
                                        <TableCell className="font-medium">{element.name}</TableCell>
                                        <TableCell>
                                            <span className="font-mono bg-muted px-2 py-1 rounded-md text-sm">{element.selector}</span>
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
                                                    <DropdownMenuItem onClick={() => handleEditElement(element)}>
                                                        <Pencil className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the element.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteElement(element.id)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No elements in repository. Click "Add Element" to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <ElementFormDialog 
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                element={editingElement}
                onSave={handleSaveElement}
             />
        </div>
    )
}
