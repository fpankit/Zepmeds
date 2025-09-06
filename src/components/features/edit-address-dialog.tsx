
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSave: (newAddress: string) => void;
}

export function EditAddressDialog({
  isOpen,
  onClose,
  currentAddress,
  onSave,
}: EditAddressDialogProps) {
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");

  useEffect(() => {
    // A simple parser for the address string. This might need to be more robust.
    const parts = currentAddress.split(",").map(p => p.trim());
    setStreet(parts.slice(1, -2).join(', ') || parts[0] || "");
    setHouse(parts[0] || "");
    setLandmark(""); // Reset landmark as it's not easily parsed
  }, [currentAddress]);

  const handleSave = () => {
    // Construct the new address string
    const newAddress = [house, street, landmark]
        .filter(Boolean) // Remove empty parts
        .join(", ");
    onSave(newAddress);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Address Details</DialogTitle>
          <DialogDescription>
            Add more details like your house number and a nearby landmark for better accuracy.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="house">House No., Flat, Building</Label>
            <Input id="house" value={house} onChange={(e) => setHouse(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Street, Area, Colony</Label>
            <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark</Label>
            <Input id="landmark" placeholder="E.g., Near City Hospital" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">
                    Cancel
                </Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Address</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
