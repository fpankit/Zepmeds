
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
import { Home, MapPin, Plus, Search, Pencil, LocateFixed } from "lucide-react";
import { Separator } from "../ui/separator";

const initialAddresses = [
    {
      id: "1",
      name: "Home",
      address: "Ghh, Bnn, Gurugram, 122001",
      icon: Home,
    },
];


export function LocationSheet({ children }: { children: React.ReactNode }) {
  const [savedAddresses, setSavedAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState("1");
  

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Select Location</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for area, street name..." className="pl-10" />
          </div>

          <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
            <LocateFixed className="h-5 w-5 mr-3 text-green-500" />
            <div>
              <p className="font-semibold text-green-500">Use your current location</p>
              <p className="text-xs text-muted-foreground">741/2, Gurugram, Haryana, 122001</p>
            </div>
          </Button>

           <Button variant="ghost" className="w-full justify-start p-3">
             <Plus className="h-5 w-5 mr-3" />
             <span className="font-semibold">Add New Address</span>
          </Button>

          <Separator />

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
              Your saved addresses
            </h3>
            <div className="space-y-4">
              {savedAddresses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-card"
                  onClick={() => setSelectedAddressId(item.id)}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.address}</p>
                  </div>
                  {selectedAddressId === item.id ? (
                     <Button size="sm" className="pointer-events-none bg-primary/80">Currently Selected</Button>
                  ) : (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
