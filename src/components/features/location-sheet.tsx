
"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, MapPin, Plus, Search, LocateFixed, Briefcase, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useAuth, Address } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const iconMap = {
    Home: Home,
    Work: Briefcase,
    Other: MapPin,
}

function AddAddressForm({ onAddAddress }: { onAddAddress: (address: Omit<Address, 'id' | 'icon'>) => void }) {
    const [type, setType] = useState<Address['type']>("Home");
    const [address, setAddress] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (address.trim()) {
            onAddAddress({ name: type, type, address });
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a new address</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label>Address Type</Label>
                        <RadioGroup value={type} onValueChange={(v) => setType(v as Address['type'])} className="flex gap-4 mt-2">
                           <Label htmlFor="home" className="flex items-center gap-2 cursor-pointer">
                                <RadioGroupItem value="Home" id="home" />
                                <Home className="w-4 h-4 mr-1" /> Home
                            </Label>
                             <Label htmlFor="work" className="flex items-center gap-2 cursor-pointer">
                                <RadioGroupItem value="Work" id="work" />
                                <Briefcase className="w-4 h-4 mr-1" /> Work
                            </Label>
                            <Label htmlFor="other" className="flex items-center gap-2 cursor-pointer">
                                <RadioGroupItem value="Other" id="other" />
                                <MapPin className="w-4 h-4 mr-1" /> Other
                            </Label>
                        </RadioGroup>
                    </div>
                    <div>
                        <Label htmlFor="address-input">Full Address</Label>
                        <Input 
                            id="address-input"
                            placeholder="Enter your full address" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                         />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Address</Button>
                </DialogFooter>
            </DialogContent>
        </form>
    )
}


export function LocationSheet({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState(user?.addresses[0]?.id || "");
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  const handleAddAddress = (newAddressData: Omit<Address, 'id' | 'icon'>) => {
      const newAddress: Address = {
          ...newAddressData,
          id: Date.now().toString(),
      };
      const updatedAddresses = [...(user?.addresses || []), newAddress];
      updateUser({ addresses: updatedAddresses });
      setSelectedAddressId(newAddress.id);
      setIsAddAddressOpen(false); // Close dialog on submit
  }
  
  const handleDeleteAddress = (id: string) => {
      const updatedAddresses = (user?.addresses || []).filter(addr => addr.id !== id);
      updateUser({ addresses: updatedAddresses });
      if (selectedAddressId === id) {
          setSelectedAddressId(user?.addresses[0]?.id || "");
      }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg max-h-[90vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Select Location</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for area, street name..." className="pl-10" />
          </div>

          <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left text-green-500 hover:text-green-500">
            <LocateFixed className="h-5 w-5 mr-3" />
            <div>
              <p className="font-semibold">Use your current location</p>
              <p className="text-xs text-muted-foreground">741/2, Gurugram, Haryana, 122001</p>
            </div>
          </Button>

            <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-3">
                        <Plus className="h-5 w-5 mr-3" />
                        <span className="font-semibold">Add New Address</span>
                    </Button>
                </DialogTrigger>
                <AddAddressForm onAddAddress={handleAddAddress} />
            </Dialog>


          <Separator />

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
              Your saved addresses
            </h3>
            <div className="space-y-4">
              {(user?.addresses || []).map((item) => {
                const Icon = iconMap[item.type] || MapPin;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-card cursor-pointer"
                    onClick={() => setSelectedAddressId(item.id)}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.address}</p>
                    </div>
                    {selectedAddressId === item.id ? (
                      <Button size="sm" className="pointer-events-none bg-primary/80 text-xs h-7">Selected</Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(item.id)}}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
