
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import { MapPin, Plus, ChevronLeft, Ticket, Home, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";


const addresses = [
  { id: "home", type: "Home", address: "123 Main Street, Apartment 4B, New York, NY 10001", icon: Home },
  { id: "work", type: "Work", address: "456 Business Ave, Suite 200, New York, NY 10002", icon: Briefcase },
];

const deliveryOptions = [
    { id: "express", name: "Express Delivery", time: "15-30 minutes", price: 50, default: true},
    { id: "standard", name: "Standard Delivery", time: "2-3 hours", price: 0}
]

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(addresses[0].id);
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryOptions.find(d => d.default)?.id ?? deliveryOptions[0].id)

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = deliveryOptions.find(d => d.id === selectedDelivery)?.price ?? 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    // In a real app, this would trigger an API call to the backend to create an order.
    // For this prototype, we'll just clear the cart and navigate to a success page.
    alert("Order placed successfully!");
    clearCart();
    router.push("/home");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Custom Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Checkout</h1>
          <div className="w-8"></div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="text-primary"/> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-4">
              {addresses.map((addr) => (
                <LabelRadio
                    key={addr.id}
                    value={addr.id}
                    label={addr.type}
                    description={addr.address}
                    icon={addr.icon}
                    isSelected={selectedAddress === addr.id}
                />
              ))}
            </RadioGroup>
             <Button variant="outline" className="w-full mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add New Address
             </Button>
          </CardContent>
        </Card>

        {/* Delivery Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="text-primary"/> Delivery Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedDelivery} onValueChange={setSelectedDelivery} className="space-y-4">
              {deliveryOptions.map((opt) => (
                <LabelRadio
                    key={opt.id}
                    value={opt.id}
                    label={opt.name}
                    description={`Delivered within ${opt.time}`}
                    price={opt.price}
                    isSelected={selectedDelivery === opt.id}
                />
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        
        {/* Apply Coupon */}
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Ticket className="text-primary rotate-45"/> Apply Coupon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
                <input placeholder="Enter Coupon Code" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                <Button>Apply</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>₹{subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Delivery Fee</p>
                    <p>₹{deliveryFee.toFixed(2)}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <p>Total Amount</p>
                    <p>₹{total.toFixed(2)}</p>
                </div>
            </CardContent>
        </Card>
      </main>

       {/* Footer */}
      <footer className="p-4 border-t border-border bg-background">
        <Button onClick={handlePlaceOrder} className="w-full text-lg font-bold py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity">
            Place Order
        </Button>
      </footer>
    </div>
  );
}


function LabelRadio({ value, label, description, icon: Icon, price, isSelected }: { value: string, label: string, description: string, icon?: React.ElementType, price?: number, isSelected: boolean}) {
    return (
        <label htmlFor={value} className={cn("flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all", isSelected ? "border-primary ring-2 ring-primary bg-primary/10" : "border-border")}>
            <RadioGroupItem value={value} id={value} />
            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            <div className="flex-1">
                <div className="flex justify-between">
                    <p className="font-semibold">{label}</p>
                    {price !== undefined && <p className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground")}>₹{price.toFixed(2)}</p>}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </label>
    )
}
