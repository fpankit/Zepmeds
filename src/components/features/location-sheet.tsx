
"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, MapPin, Plus, Search, LocateFixed, Briefcase, Trash2, Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useAuth, Address } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";

const DynamicMap = dynamic(
    () => import('@/components/features/dynamic-map').then(mod => mod.DynamicMap),
    { 
        ssr: false, 
        loading: () => <Skeleton className="h-48 w-full" /> 
    }
);

type Position = {
    lat: number;
    lng: number;
}

function AddAddressForm({ onAddAddress, closeDialog }: { onAddAddress: (address: Omit<Address, 'id' | 'address'>) => Promise<void>, closeDialog: () => void }) {
    const [type, setType] = useState<Address['type']>("Home");
    const [flat, setFlat] = useState("");
    const [street, setStreet] = useState("");
    const [landmark, setLandmark] = useState("");
    const [pincode, setPincode] = useState("");
    const [state, setState] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [position, setPosition] = useState<Position | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (flat.trim() && street.trim() && pincode.trim() && state.trim()) {
            setIsSubmitting(true);
            await onAddAddress({ 
                name: type, 
                type, 
                flat, 
                street, 
                landmark, 
                pincode, 
                state 
            });
            setIsSubmitting(false);
            closeDialog();
        }
    };
    
    const handleFetchLocation = () => {
        setIsFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition({ lat: latitude, lng: longitude });

                // Reverse geocode
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                
                const { address } = data;
                setStreet(address.road || '');
                setFlat(address.house_number || '');
                setState(address.state || '');
                setPincode(address.postcode || '');
                setLandmark(address.suburb || '');

                setIsFetchingLocation(false);
            },
            (error) => {
                console.error("Geolocation error: ", error);
                // You should show a toast message to the user here
                setIsFetchingLocation(false);
            }
        );
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <Button type="button" variant="outline" onClick={handleFetchLocation} disabled={isFetchingLocation}>
                    {isFetchingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LocateFixed className="mr-2 h-4 w-4" />}
                    {isFetchingLocation ? "Fetching Location..." : "Use Current Location"}
                </Button>

                {position && <DynamicMap position={position} />}

                <div className="space-y-2">
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
                <div className="space-y-2">
                    <Label htmlFor="flat">Flat, House no., Building</Label>
                    <Input id="flat" value={flat} onChange={(e) => setFlat(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="street">Area, Street, Sector, Village</Label>
                    <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input id="landmark" placeholder="E.g. Near Apollo Hospital" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Address
                </Button>
            </DialogFooter>
        </form>
    )
}

export function LocationSheet({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState(user?.addresses[0]?.id || "");
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  
  const handleAddAddress = async (newAddressData: Omit<Address, 'id' | 'address'>) => {
      if (!user) return;
      const fullAddress = `${newAddressData.flat}, ${newAddressData.street}${newAddressData.landmark ? `, ${newAddressData.landmark}` : ''}, ${newAddressData.pincode}, ${newAddressData.state}`;
      const newAddress: Address = {
          ...newAddressData,
          id: Date.now().toString(),
          address: fullAddress,
      };
      const updatedAddresses = [...(user?.addresses || []), newAddress];
      await updateUser({ addresses: updatedAddresses });
      setSelectedAddressId(newAddress.id);
  }
  
  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter(addr => addr.id !== id);
    await updateUser({ addresses: updatedAddresses });
    if (selectedAddressId === id) {
      setSelectedAddressId(updatedAddresses[0]?.id || "");
    }
  }

  useEffect(() => {
    if (user && user.addresses.length > 0 && !selectedAddressId) {
        setSelectedAddressId(user.addresses[0].id);
    }
  }, [user, selectedAddressId]);

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

          <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" className="w-full justify-start p-3">
                    <Plus className="h-5 w-5 mr-3" />
                    <span className="font-semibold">Add New Address</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add a new address</DialogTitle>
                     <DialogDescription>
                        Enter your address details or use your current location.
                    </DialogDescription>
                </DialogHeader>
                <AddAddressForm onAddAddress={handleAddAddress} closeDialog={() => setIsAddAddressOpen(false)} />
            </DialogContent>
          </Dialog>

          <Separator />

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
              Your saved addresses
            </h3>
            <div className="space-y-4">
              {(user?.addresses || []).map((item) => {
                const Icon = item.type === "Home" ? Home : item.type === "Work" ? Briefcase : MapPin;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-card"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedAddressId(item.id)}>
                        <div className="flex items-center gap-4">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.address}</p>
                            </div>
                        </div>
                    </div>
                    {selectedAddressId === item.id ? (
                      <div className="text-primary text-xs font-bold px-2 py-1 rounded-full bg-primary/10">Selected</div>
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

    