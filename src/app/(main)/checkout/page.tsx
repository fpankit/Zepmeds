

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Label } from "@/components/ui/label";

const deliveryOptions = [
    { id: "express", name: "Express Delivery", time: "15-30 minutes", price: 50},
    { id: "standard", name: "Standard Delivery", time: "2-3 hours", price: 0},
    { id: "scheduled", name: "Scheduled Delivery", time: "Choose your slot", price: 0, default: true}
]

const paymentMethods = [
    { id: "upi", name: "UPI", icon: Wallet },
    { id: "wallets", name: "Wallets", icon: Wallet },
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "cod", name: "Cash on Delivery", icon: DollarSign },
]

const iconMap: Record<"Home" | "Work" | "Other", React.ElementType> = {
    Home,
    Work: Briefcase,
    Other: MapPin
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, prescription } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryOptions.find(d => d.default)?.id ?? deliveryOptions[0].id)
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
  const [deliveryTime, setDeliveryTime] = useState<string>("10:00 AM - 12:00 PM");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(user.addresses[0].id);
    }
  }, [user, selectedAddressId]);


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

    const currentAddress = user.addresses.find(a => a.id === selectedAddressId);

    if (!currentAddress) {
      toast({ variant: "destructive", title: "Please select a delivery address."});
      setIsLoading(false);
      return;
    }

    try {
        const orderData: any = {
            userId: user.id,
            cart: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
            total,
            subtotal,
            deliveryFee,
            deliveryOption: selectedDelivery,
            deliveryDate: deliveryDate ? deliveryDate.toISOString().split('T')[0] : null,
            deliveryTime,
            paymentMethod: selectedPayment,
            customerDetails: {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                address: currentAddress.address,
                phone: user.phone,
            },
            status: "Order Confirmed",
            orderDate: serverTimestamp(),
        };

        if (prescription) {
            orderData.prescription = {
                dataUri: prescription.dataUri,
                summary: prescription.summary,
                status: 'pending_approval' // Set initial status for admin
            }
        }


        const docRef = await addDoc(collection(db, "orders"), orderData);
        console.log("Order placed with ID: ", docRef.id);
        
        toast({
            title: "Order Placed Successfully!",
            description: "You will be redirected to the order status page.",
        });

        clearCart();
        router.push(`/order-status?orderId=${docRef.id}`);

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
                <MapPin className="text-primary"/> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-4">
              {(user?.addresses || []).map((addr) => (
                <LabelRadio
                    key={addr.id}
                    value={addr.id}
                    label={addr.type}
                    description={addr.address}
                    icon={iconMap[addr.type]}
                    isSelected={selectedAddressId === addr.id}
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
                />
              ))}
            </RadioGroup>

            {selectedDelivery === 'scheduled' && (
                <div className="mt-4 p-4 border-t border-border space-y-4">
                     <h4 className="font-semibold text-md">Select Date & Time</h4>
                     <p className="text-sm text-muted-foreground">Please select a date and time for your delivery.</p>
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
                <CreditCard className="text-primary"/> Payment Method
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


function LabelRadio({ value, label, description, icon: Icon, price, isSelected, ...props }: { value: string, label: string, description: string, icon?: React.ElementType, price?: number, isSelected: boolean}) {
    
    return (
        <label htmlFor={value} className={cn("group flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all", isSelected ? 'ring-2 border-primary ring-primary bg-primary/10' : "border-border")}>
            <RadioGroupItem value={value} id={value} />
            {Icon && <Icon className={cn("h-5 w-5 text-muted-foreground", isSelected && "text-primary")} />}
            <div className="flex-1">
                <div className="flex justify-between">
                    <p className="font-semibold">{label}</p>
                    {price !== undefined && <p className={cn("text-sm font-semibold text-muted-foreground", isSelected && "text-primary")}>{price > 0 ? `₹${price.toFixed(2)}` : 'Free'}</p>}
                </div>
               {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
        </label>
    )
}

    
