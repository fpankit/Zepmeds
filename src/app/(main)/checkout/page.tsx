
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { MapPin, Plus, ChevronLeft, Ticket, Home, Briefcase, Calendar, Clock, Wallet, CreditCard, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Label } from "@/components/ui/label";

const deliveryOptions = [
    { id: "express", name: "Express Delivery", time: "15-30 minutes", price: 50, color: "red"},
    { id: "standard", name: "Standard Delivery", time: "2-3 hours", price: 0, color: "blue"},
    { id: "scheduled", name: "Scheduled Delivery", time: "Choose your slot", price: 0, default: true, color: "orange"}
]

const paymentMethods = [
    { id: "upi", name: "UPI", icon: Wallet },
    { id: "wallets", name: "Wallets", icon: Wallet },
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "cod", name: "Cash on Delivery", icon: DollarSign },
]

const iconMap = {
    Home,
    Work: Briefcase,
    Other: MapPin
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses[0]?.id || "");
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryOptions.find(d => d.default)?.id ?? deliveryOptions[0].id)
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
  const [deliveryTime, setDeliveryTime] = useState<string>("10:00 AM - 12:00 PM");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(user.addresses[0].id);
    }
  }, [user, selectedAddress]);


  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = deliveryOptions.find(d => d.id === selectedDelivery)?.price ?? 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to place an order."});
      setIsLoading(false);
      return;
    }

    const currentAddress = user.addresses.find(a => a.id === selectedAddress);

    if (!currentAddress) {
      toast({ variant: "destructive", title: "Please select a delivery address."});
      setIsLoading(false);
      return;
    }

    try {
        const orderData = {
            cart: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
            total,
            subtotal,
            deliveryFee,
            deliveryOption: selectedDelivery,
            deliveryDate: deliveryDate ? deliveryDate.toISOString().split('T')[0] : null,
            deliveryTime,
            paymentMethod: selectedPayment,
            customerDetails: {
                name: user.name,
                address: currentAddress.address,
                phone: user.phone,
            },
            status: "Order Confirmed",
            orderDate: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "orders"), orderData);
        console.log("Order placed with ID: ", docRef.id);
        
        toast({
            title: "Order Placed Successfully!",
            description: "You will be redirected to the order status page.",
        });

        clearCart();
        router.push("/order-status");

    } catch (error) {
        console.error("Failed to place order:", error);
        toast({
            variant: "destructive",
            title: "Order Failed",
            description: "There was a problem placing your order. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
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
                <MapPin className="text-yellow-500"/> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-4">
              {(user?.addresses || []).map((addr) => (
                <LabelRadio
                    key={addr.id}
                    value={addr.id}
                    label={addr.type}
                    description={addr.address}
                    icon={iconMap[addr.type]}
                    isSelected={selectedAddress === addr.id}
                    data-selection-color="yellow"
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
                <Clock className="text-primary"/> Delivery Time
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
                    data-selection-color={opt.color}
                />
              ))}
            </RadioGroup>

            {selectedDelivery === 'scheduled' && (
                <div className="mt-4 p-4 border-t border-border space-y-4">
                     <h4 className="font-semibold text-md">Select Date & Time</h4>
                    <CalendarComponent
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        className="rounded-md border"
                    />
                    <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</SelectItem>
                            <SelectItem value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</SelectItem>
                            <SelectItem value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</SelectItem>
                            <SelectItem value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
          </CardContent>
        </Card>
        
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="text-purple-500"/> Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="space-y-4">
              {paymentMethods.map((method) => (
                <LabelRadio
                    key={method.id}
                    value={method.id}
                    label={method.name}
                    description=""
                    icon={method.icon}
                    isSelected={selectedPayment === method.id}
                    data-selection-color="purple"
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
        <Button onClick={handlePlaceOrder} disabled={isLoading} className="w-full text-lg font-bold py-6 bg-gradient-to-r from-green-500 to-green-700 text-white hover:opacity-90 transition-opacity">
            {isLoading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </footer>
    </div>
  );
}


function LabelRadio({ value, label, description, icon: Icon, price, isSelected, ...props }: { value: string, label: string, description: string, icon?: React.ElementType, price?: number, isSelected: boolean, "data-selection-color"?: string}) {
    
    const selectionColor = props['data-selection-color'] || 'primary';

    const colorVariants: Record<string, string> = {
        red: "[&[data-selected=true]]:border-red-500 [&[data-selected=true]]:ring-red-500 [&[data-selected=true]]:bg-red-500/10",
        orange: "[&[data-selected=true]]:border-orange-500 [&[data-selected=true]]:ring-orange-500 [&[data-selected=true]]:bg-orange-500/10",
        blue: "[&[data-selected=true]]:border-blue-500 [&[data-selected=true]]:ring-blue-500 [&[data-selected=true]]:bg-blue-500/10",
        yellow: "[&[data-selected=true]]:border-yellow-500 [&[data-selected=true]]:ring-yellow-500 [&[data-selected=true]]:bg-yellow-500/10",
        purple: "[&[data-selected=true]]:border-purple-500 [&[data-selected=true]]:ring-purple-500 [&[data-selected=true]]:bg-purple-500/10",
        primary: "[&[data-selected=true]]:border-primary [&[data-selected=true]]:ring-primary [&[data-selected=true]]:bg-primary/10",
    };
    
    const iconColorVariants: Record<string, string> = {
        red: "group-data-[selected=true]:text-red-500",
        orange: "group-data-[selected=true]:text-orange-500",
        blue: "group-data-[selected=true]:text-blue-500",
        yellow: "group-data-selected]:text-yellow-500",
        purple: "group-data-[selected=true]:text-purple-500",
        primary: "group-data-[selected=true]:text-primary",
    }
    
    const selectedClass = colorVariants[selectionColor] || colorVariants.primary;
    const iconSelectedClass = iconColorVariants[selectionColor] || iconColorVariants.primary;
    
    return (
        <label htmlFor={value} data-selected={isSelected} className={cn("group flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all", isSelected ? 'ring-2' : "border-border", selectedClass)}>
            <RadioGroupItem value={value} id={value} />
            {Icon && <Icon className={cn("h-5 w-5 text-muted-foreground", iconSelectedClass)} />}
            <div className="flex-1">
                <div className="flex justify-between">
                    <p className="font-semibold">{label}</p>
                    {price !== undefined && <p className={cn("text-sm font-semibold text-muted-foreground", `group-data-[selected=true]:text-${selectionColor}-500`)}>{price > 0 ? `₹${price.toFixed(2)}` : 'Free'}</p>}
                </div>
               {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
        </label>
    )
}
