
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UIElement } from './repository-view';

interface ElementFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  element: UIElement | null;
  onSave: (element: UIElement) => void;
}

export default function ElementFormDialog({ isOpen, onOpenChange, element, onSave }: ElementFormDialogProps) {
  const [name, setName] = useState('');
  const [selector, setSelector] = useState('');

  useEffect(() => {
    if (element) {
      setName(element.name);
      setSelector(element.selector);
    } else {
      setName('');
      setSelector('');
    }
  }, [element, isOpen]);

  const handleSubmit = () => {
    if (name && selector) {
      onSave({
        id: element?.id ?? Date.now(),
        name,
        selector,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{element ? 'Edit Element' : 'Add New Element'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Login Button"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="selector" className="text-right">
              Selector
            </Label>
            <Input
              id="selector"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="col-span-3"
              placeholder="e.g., button[type='submit']"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Element</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
