
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Home, Briefcase, MapPin, Plus, LocateFixed, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Address } from "@/context/auth-context";
import { DynamicMap } from "@/components/features/dynamic-map";
import { Skeleton } from "../ui/skeleton";

type Position = {
  lat: number;
  lng: number;
};

interface AddAddressFormProps {
  onAddAddress: (address: Omit<Address, "id" | "address">) => Promise<void>;
}

export function AddAddressForm({ onAddAddress }: AddAddressFormProps) {
  const [type, setType] = useState<Address["type"]>("Home");
  const [flat, setFlat] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setType("Home");
    setFlat("");
    setStreet("");
    setLandmark("");
    setPincode("");
    setState("");
    setPosition(null);
  }

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
        state,
      });
      setIsSubmitting(false);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleFetchLocation = () => {
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        )
          .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch address.");
            return response.json();
          })
          .then((data) => {
            const { address } = data;
            if (!address)
              throw new Error("Address details not found in response.");

            setStreet(
              address.road ||
                [address.suburb, address.city_district]
                  .filter(Boolean)
                  .join(", ") ||
                ""
            );
            setFlat(address.house_number || "");
            setState(address.state || "");
            setPincode(address.postcode || "");
            setLandmark("");

            toast({
              title: "Location Fetched!",
              description: "Your address has been auto-filled.",
            });
          })
          .catch((error) => {
            console.error("Reverse geocoding error: ", error);
            toast({
              variant: "destructive",
              title: "Could not fetch address",
              description:
                "Unable to auto-fill address details. Please enter them manually.",
            });
          })
          .finally(() => {
            setIsFetchingLocation(false);
          });
      },
      (error) => {
        console.error("Geolocation error: ", error);
        toast({
          variant: "destructive",
          title: "Geolocation Failed",
          description:
            "Please enable location permissions in your browser to use this feature.",
        });
        setIsFetchingLocation(false);
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a new address</DialogTitle>
          <DialogDescription>
            Enter your address details or use your current location.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleFetchLocation}
              disabled={isFetchingLocation}
            >
              {isFetchingLocation ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="mr-2 h-4 w-4" />
              )}
              {isFetchingLocation
                ? "Fetching Location..."
                : "Use Current Location"}
            </Button>

            {position ? <DynamicMap position={position} /> : (isFetchingLocation && <Skeleton className="h-48 w-full" />)}

            <div className="space-y-2">
              <Label>Address Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as Address["type"])}
                className="flex gap-4 mt-2"
              >
                <Label
                  htmlFor="home"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RadioGroupItem value="Home" id="home" />
                  <Home className="w-4 h-4 mr-1" /> Home
                </Label>
                <Label
                  htmlFor="work"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RadioGroupItem value="Work" id="work" />
                  <Briefcase className="w-4 h-4 mr-1" /> Work
                </Label>
                <Label
                  htmlFor="other"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RadioGroupItem value="Other" id="other" />
                  <MapPin className="w-4 h-4 mr-1" /> Other
                </Label>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flat">Flat, House no., Building</Label>
              <Input
                id="flat"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Area, Street, Sector, Village</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                placeholder="E.g. Near Apollo Hospital"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
