
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, Bot, MapPin, CheckCircle, PackageCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Product } from "@/lib/types";

// --- Client-side Speech Recognition Setup ---
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-IN'; // Prioritize Indian English
}

type VoiceSheetState = 'idle' | 'permission' | 'listening' | 'processing' | 'confirming';
type FoundMedicine = Product & { quantity: number };

export function VoiceOrderSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<VoiceSheetState>('idle');
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [foundMedicines, setFoundMedicines] = useState<FoundMedicine[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { productMap } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetState = useCallback(() => {
    setState('idle');
    setTranscript("");
    setFinalTranscript("");
    setFoundMedicines([]);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      if(recognition) recognition.stop();
      resetState();
    }
  };

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Browser Not Supported', description: 'Your browser does not support Speech Recognition.' });
      handleOpenChange(false);
      return;
    }
    if (!user || user.isGuest) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to place a voice order.' });
      handleOpenChange(false);
      router.push('/login');
      return;
    }

    setState('permission');

    const defaultAddress = user.addresses?.[0]?.address || "Default Address not set";
    setLocation(defaultAddress);

    setTranscript("");
    setFinalTranscript("");
    setState('listening');
    recognition.start();

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + interim);
      if(final) {
        setFinalTranscript(prev => prev + final + ". ");
      }
      if(timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
         recognition.stop();
      }, 3000);
    };

    recognition.onend = () => {
      if (state !== 'processing' && state !== 'confirming') {
         setState(prev => (prev === 'listening' ? 'processing' : prev));
      }
    };
    
    recognition.onerror = (event: any) => {
        toast({ variant: 'destructive', title: 'Speech Error', description: `Could not process audio. Error: ${event.error}` });
        handleOpenChange(false);
        resetState();
    };

  }, [toast, state, user, router, handleOpenChange, resetState]);
  
  const placeOrder = useCallback(async (medicinesToOrder: FoundMedicine[]) => {
    if (!user || user.isGuest || !location) {
      toast({ variant: 'destructive', title: 'Cannot place order', description: 'User or location is missing.' });
      handleOpenChange(false);
      resetState();
      return;
    }

    const subtotal = medicinesToOrder.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;

    try {
        const orderData = {
            userId: user.id,
            cart: medicinesToOrder.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
            total,
            subtotal,
            deliveryFee,
            deliveryOption: 'express',
            paymentMethod: 'cod',
            customerDetails: {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                address: location,
                phone: user.phone,
            },
            status: "Order Confirmed",
            orderDate: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "orders"), orderData);
        
        toast({
            title: "Order Placed Successfully!",
            description: "Redirecting to your order status...",
        });

        router.push(`/order-status?orderId=${docRef.id}`);
        handleOpenChange(false);

    } catch (error) {
        console.error("Failed to place order:", error);
        toast({ variant: 'destructive', title: 'Order Failed', description: 'There was a problem placing your order.' });
        handleOpenChange(false);
        resetState();
    }
  }, [user, location, toast, router, handleOpenChange, resetState]);

  useEffect(() => {
    if (state === 'processing' && finalTranscript) {
      const words = finalTranscript.toLowerCase().replace(/and/g, ',').split(',').map(s => s.trim()).filter(Boolean);
      
      const found: FoundMedicine[] = [];
      const productNames = Array.from(productMap.keys()).map(k => k.toLowerCase());

      words.forEach(word => {
          productNames.forEach(productName => {
              if ((productName.includes(word) || word.includes(productName)) && word.length > 2) {
                  const productKey = Array.from(productMap.keys()).find(k => k.toLowerCase() === productName)!;
                  const product = productMap.get(productKey)!;
                  if (!found.some(f => f.id === product.id)) {
                      found.push({ ...product, quantity: 1 });
                  }
              }
          })
      });

      if (found.length > 0) {
        setFoundMedicines(found);
        setState('confirming');
      } else {
        toast({
          variant: "destructive",
          title: "No Medicines Found",
          description: `Could not find any items for: "${finalTranscript}". Please try again.`,
        });
        handleOpenChange(false);
        resetState();
      }
    }
  }, [state, finalTranscript, productMap, toast, handleOpenChange, resetState]);

  useEffect(() => {
    if (state === 'confirming' && foundMedicines.length > 0) {
        const timer = setTimeout(() => {
            placeOrder(foundMedicines);
        }, 1500);

        return () => clearTimeout(timer);
    }
  }, [state, foundMedicines, placeOrder]);

  const getStateContent = () => {
      switch (state) {
          case 'idle':
              return {
                  icon: <Bot className="h-16 w-16 text-primary" />,
                  title: "Voice Order",
                  description: "Tap the mic, say the medicines you need, and we'll place an urgent order for you instantly.",
                  footer: <Button className="w-full" onClick={startListening}>Start Listening</Button>
              };
          case 'permission':
              return {
                  icon: <Loader2 className="h-16 w-16 text-primary animate-spin" />,
                  title: "Getting Ready...",
                  description: "Please allow microphone access. We'll use your default address for delivery.",
                  footer: null
              }
        case 'listening':
            return {
                icon: (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <Mic className="h-16 w-16 text-red-500" />
                    </motion.div>
                ),
                title: "Listening...",
                description: "Tell me the names of the medicines you need. For example, 'Paracetamol and a Crocin'.",
                footer: null
            };
        case 'processing':
            return {
                icon: <Loader2 className="h-16 w-16 text-primary animate-spin" />,
                title: "Processing your request...",
                description: "Finding the medicines you asked for. Please wait.",
                footer: null
            };
        case 'confirming':
            const subtotal = foundMedicines.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            return {
                icon: <CheckCircle className="h-16 w-16 text-green-500" />,
                title: "Items Found!",
                description: null,
                customBody: (
                    <div className="w-full max-w-sm text-left space-y-4">
                        <div className="bg-muted p-3 rounded-md space-y-2">
                            {foundMedicines.map((med, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="font-medium">{med.name}</span>
                                    <span className="font-mono">₹{med.price.toFixed(2)}</span>
                                </div>
                            ))}
                             <div className="flex justify-between items-center border-t pt-2 font-bold">
                                <span>Total</span>
                                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        {location && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="truncate">Delivering To: {location}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2 pt-2">
                           <Loader2 className="h-4 w-4 animate-spin"/>
                           <p className="text-sm text-muted-foreground">Placing your order now...</p>
                        </div>
                    </div>
                ),
                footer: null
            };
        default: return null;
      }
  }

  const content = getStateContent();

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="icon" className="h-16 w-16 rounded-full shadow-lg" onClick={() => handleOpenChange(true)}>
            <Mic className="h-8 w-8"/>
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl h-full md:h-auto md:max-h-[90vh]">
          <div className="flex flex-col h-full text-center p-4">
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <AnimatePresence mode="wait">
                     <motion.div
                        key={state}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center space-y-4"
                     >
                        {content?.icon}
                        {content?.title && <h2 className="text-2xl font-bold">{content.title}</h2>}
                        {content?.description && <p className="text-muted-foreground">{content.description}</p>}
                        {content?.customBody}
                     </motion.div>
                  </AnimatePresence>

                  {state === 'listening' && transcript && (
                      <p className="text-lg italic text-foreground mt-4">"{transcript}"</p>
                  )}
              </div>
              
              {content?.footer && (
                  <div className="mt-6 w-full max-w-sm mx-auto">
                     {content.footer}
                  </div>
              )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
