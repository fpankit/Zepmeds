

"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { Minus, Plus, ShoppingCart, Trash2, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PrescriptionUploader, PrescriptionUploadDetails } from '@/components/features/prescription-uploader';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';


type PrescriptionStatus = 'needed' | 'uploaded' | 'approved' | 'rejected';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, setPrescriptionForCheckout, prescriptionForCheckout } = useCart();
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [prescriptionStatus, setPrescriptionStatus] = useState<PrescriptionStatus>('needed');
  const { toast } = useToast();
  const { user } = useAuth();

  // Listen for real-time updates on the prescription document
  useEffect(() => {
    if (!prescriptionId) return;

    const unsub = onSnapshot(doc(db, "prescriptions", prescriptionId), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            switch (data.status) {
                case 'approved':
                    setPrescriptionStatus('approved');
                    toast({
                        title: "Prescription Approved!",
                        description: "You can now proceed to checkout.",
                        variant: "default",
                        className: "bg-green-500 text-white"
                    });
                    break;
                case 'rejected':
                    setPrescriptionStatus('rejected');
                     toast({
                        variant: "destructive",
                        title: "Prescription Rejected",
                        description: data.rejectionReason || "Your prescription was rejected. Please upload a new one.",
                    });
                    break;
                default:
                    setPrescriptionStatus('uploaded');
                    break;
            }
        }
    });

    return () => unsub();
  }, [prescriptionId, toast]);
  

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  const hasRxItems = useMemo(() => cart.some(item => item.isRx), [cart]);
  
  const handlePrescriptionUploaded = (details: PrescriptionUploadDetails) => {
      setPrescriptionForCheckout({
          id: details.prescriptionId,
          summary: details.summary,
          dataUri: details.dataUri
      });
      setPrescriptionId(details.prescriptionId);
      setPrescriptionStatus('uploaded');
  };

  const resetPrescription = () => {
    setPrescriptionForCheckout(null);
    setPrescriptionId(null);
    setPrescriptionStatus('needed');
  }
  
  const isCheckoutDisabled = hasRxItems && prescriptionStatus !== 'approved';

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative flex items-center justify-center w-48 h-48 mb-6">
          <div className="relative flex items-center justify-center w-full h-full bg-card rounded-full">
            <ShoppingCart className="h-20 w-20 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/home">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Cart ({cart.length})</CardTitle>
           <Button variant="outline" size="sm" onClick={clearCart}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.name}</p>
                    {item.isRx && <span className="text-xs font-bold text-destructive border border-destructive px-1.5 py-0.5 rounded-sm">Rx</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span>{item.quantity}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                 <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {hasRxItems && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="text-primary"/> Prescription Required
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/50">
                    <AlertTriangle className="h-6 w-6 text-yellow-500"/>
                    <p className="text-sm text-yellow-400">Your cart contains items that require a valid doctor's prescription. Please upload one to proceed.</p>
                </div>
                
                {prescriptionStatus === 'needed' && <PrescriptionUploader onUploadSuccess={handlePrescriptionUploaded} cart={cart}/>}
                
                {prescriptionStatus === 'uploaded' && (
                     <div className="flex items-center gap-3 p-3 rounded-md bg-blue-500/10 border border-blue-500/50">
                        <Clock className="h-6 w-6 text-blue-500"/>
                        <div>
                            <p className="text-sm font-bold text-blue-400">Prescription Submitted</p>
                            <p className="text-xs text-blue-500">Please wait while our pharmacy team verifies your prescription. This may take a few minutes.</p>
                        </div>
                    </div>
                )}
                 {prescriptionStatus === 'approved' && (
                     <div className="flex items-center gap-3 p-3 rounded-md bg-green-500/10 border border-green-500/50">
                        <CheckCircle className="h-6 w-6 text-green-500"/>
                        <div>
                            <p className="text-sm font-bold text-green-400">Prescription Approved</p>
                            <p className="text-xs text-green-500">You may now proceed to checkout.</p>
                        </div>
                    </div>
                )}

                 {prescriptionStatus === 'rejected' && ( 
                     <div className="flex flex-col gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/50">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-destructive"/>
                            <p className="text-sm text-destructive">Your prescription was rejected. Please upload a valid one to continue.</p>
                        </div>
                        <Button variant="outline" onClick={resetPrescription}>Upload Again</Button>
                    </div>
                )}
            </CardContent>
        </Card>
      )}


      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
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
            <p>Total</p>
            <p>₹{total.toFixed(2)}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild={!isCheckoutDisabled} disabled={isCheckoutDisabled}>
            <Link href="/checkout">
              {isCheckoutDisabled ? 'Awaiting Prescription Approval' : 'Proceed to Checkout'}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
