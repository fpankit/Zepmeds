
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, Bot, MapPin, CheckCircle } from "lucide-react";
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

type VoiceSheetState = 'idle' | 'permission' | 'listening' | 'processing' | 'confirming' | 'ordering';
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
  const isProcessingRef = useRef(false);

  const resetState = useCallback(() => {
    setState('idle');
    setTranscript("");
    setFinalTranscript("");
    setFoundMedicines([]);
    isProcessingRef.current = false;
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
      return;
    }
    if (!user || user.isGuest) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to place a voice order.' });
      router.push('/login');
      handleOpenChange(false);
      return;
    }

    setState('permission');
    const defaultAddress = user.addresses?.[0]?.address || "No address saved. Please add one.";
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
         if (recognition) recognition.stop();
      }, 2500); // Stop after 2.5s of silence
    };

    recognition.onend = () => {
       if (isProcessingRef.current) return;
       isProcessingRef.current = true;
       setState('processing');
    };
    
    recognition.onerror = (event: any) => {
        toast({ variant: 'destructive', title: 'Speech Error', description: `Could not process audio. Error: ${event.error}` });
        handleOpenChange(false);
    };

  }, [toast, user, router, handleOpenChange]);
  
  const placeOrder = useCallback(async () => {
    if (foundMedicines.length === 0) return;
    
    setState('ordering');

    if (!user || user.isGuest || !location || location.includes("No address")) {
      toast({ variant: 'destructive', title: 'Cannot place order', description: 'User or location is missing.' });
      handleOpenChange(false);
      return;
    }

    const subtotal = foundMedicines.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;

    try {
        const orderData = {
            userId: user.id,
            cart: foundMedicines.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
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
    }
  }, [user, location, toast, router, handleOpenChange, foundMedicines]);

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
          title: "Medicine Not Found",
          description: `We couldn't find any items for: "${finalTranscript}". Please try again.`,
        });
        handleOpenChange(false);
      }
    }
  }, [state, finalTranscript, productMap, toast, handleOpenChange]);

  useEffect(() => {
    if (state === 'confirming') {
        const timer = setTimeout(() => {
            placeOrder();
        }, 3500); // Wait 3.5 seconds before placing order

        return () => clearTimeout(timer);
    }
  }, [state, placeOrder]);

  const getStateContent = () => {
      switch (state) {
          case 'idle':
              return {
                  icon: <Bot className="h-12 w-12 text-primary" />,
                  title: "Voice Order",
                  description: "Tap the mic, say the medicines you need, and we'll place an urgent order for you instantly.",
                  footer: <Button className="w-full" onClick={startListening}><Mic className="mr-2 h-4 w-4" /> Start Listening</Button>
              };
          case 'permission':
              return {
                  icon: <Loader2 className="h-12 w-12 text-primary animate-spin" />,
                  title: "Getting Ready...",
                  description: "Please allow microphone access. We'll use your default address for delivery.",
                  footer: null
              }
        case 'listening':
            return {
                icon: null,
                title: "Listening...",
                description: "Tell me the names of the medicines you need...",
                customBody: (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="my-8"
                    >
                        <Mic className="h-20 w-20 text-fuchsia-500" />
                    </motion.div>
                ),
                footer: null
            };
        case 'confirming':
        case 'ordering':
            return {
                icon: (
                  <div className="bg-green-500 rounded-full p-2 animate-pulse">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                ),
                title: "Items Found!",
                description: null,
                customBody: (
                    <div className="w-full max-w-sm text-left space-y-6 my-6">
                        <div className="bg-muted/50 p-4 rounded-md space-y-3">
                            {foundMedicines.map((med, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-foreground">{med.name}</span>
                                    <span className="font-mono">₹{med.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        {location && (
                          <div className="text-sm text-muted-foreground flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-foreground">Delivering To:</span>
                                <p>{location}</p>
                              </div>
                          </div>
                        )}
                    </div>
                ),
                footer: (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        <p className="text-sm text-muted-foreground">Placing your order now...</p>
                    </div>
                )
            };
        default: return {
            icon: <Loader2 className="h-12 w-12 text-primary animate-spin" />,
            title: "Processing...",
            description: "Finding your medicines in our database.",
            footer: null
        };
      }
  }

  const content = getStateContent();

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="icon" className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-br from-fuchsia-600 to-purple-700" onClick={() => handleOpenChange(true)}>
            <Mic className="h-8 w-8"/>
        </Button>
      </div>

      <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
         <div className="flex flex-col h-full text-center p-6 bg-background">
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-8 min-h-[300px]">
                  <AnimatePresence mode="wait">
                     <motion.div
                        key={state}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center space-y-4 w-full"
                     >
                        {content?.icon}
                        {content?.title && <h2 className="text-2xl font-bold">{content.title}</h2>}
                        {content?.description && <p className="text-muted-foreground max-w-sm">{content.description}</p>}
                        {content?.customBody}
                     </motion.div>
                  </AnimatePresence>
                  {state === 'listening' && transcript && (
                      <p className="text-lg italic text-muted-foreground mt-4">"{transcript}"</p>
                  )}
              </div>
              
              {content?.footer && (
                  <div className="mt-6 w-full max-w-sm mx-auto">
                     {content.footer}
                  </div>
              )}
          </div>
      </CommandDialog>
    </>
  );
}

  