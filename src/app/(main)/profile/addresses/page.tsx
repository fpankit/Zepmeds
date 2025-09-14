
"use client";

import { useState } from "react";
import { useAuth, Address } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Search,
  Plus,
  Home,
  Briefcase,
  MapPin,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AddAddressForm } from "@/components/features/add-address-form";

const iconMap: Record<"Home" | "Work" | "Other", React.ElementType> = {
  Home,
  Work: Briefcase,
  Other: MapPin,
};

export default function ManageAddressesPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddAddress = async (newAddressData: Omit<Address, "id" | "address">) => {
    const fullAddress = `${newAddressData.flat}, ${newAddressData.street}${
      newAddressData.landmark ? `, ${newAddressData.landmark}` : ""
    }, ${newAddressData.pincode}, ${newAddressData.state}`;
    const newAddress: Address = {
      ...newAddressData,
      id: Date.now().toString(),
      address: fullAddress,
    };
    const updatedAddresses = [...(user?.addresses || []), newAddress];
    await updateUser({ addresses: updatedAddresses });
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter((addr) => addr.id !== id);
    await updateUser({ addresses: updatedAddresses });
  };

  const filteredAddresses =
    user?.addresses.filter((addr) =>
      addr.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b border-border/80">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Manage Addresses</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for an address..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <AddAddressForm onAddAddress={handleAddAddress} />

        <div className="space-y-3">
          {filteredAddresses.map((addr) => {
            const Icon = iconMap[addr.type];
            return (
              <Card key={addr.id} className="bg-card/80">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gray-700/50">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{addr.type}</p>
                      <p className="text-sm text-muted-foreground">{addr.address}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAddress(addr.id)}
                  >
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAddresses.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p>No addresses found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

