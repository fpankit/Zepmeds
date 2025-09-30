
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  CommandDialog,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, Bot, MapPin, CheckCircle, MicOff } from "lucide-react";
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

type VoiceSheetState = 'idle' | 'permission' | 'listening' | 'processing' | 'suggesting' | 'confirming' | 'ordering';
type FoundMedicine = Product & { quantity: number };

// Levenshtein distance function for fuzzy search
const levenshtein = (s1: string, s2: string): number => {
    if (s1.length > s2.length) {
        [s1, s2] = [s2, s1];
    }
    const distances = Array(s1.length + 1).fill(0).map((_, i) => i);
    for (let j = 0; j < s2.length; j++) {
        let prev = distances[0];
        distances[0]++;
        for (let i = 0; i < s1.length; i++) {
            const temp = distances[i + 1];
            distances[i + 1] = Math.min(
                temp + 1,
                distances[i] + 1,
                prev + (s1[i] === s2[j] ? 0 : 1)
            );
            prev = temp;
        }
    }
    return distances[s1.length];
};


export function VoiceOrderSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<VoiceSheetState>('idle');
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [foundMedicines, setFoundMedicines] = useState<FoundMedicine[]>([]);
  const [suggestedMedicine, setSuggestedMedicine] = useState<FoundMedicine | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
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
    setSuggestedMedicine(null);
    setIsListening(false);
    isProcessingRef.current = false;
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      if(recognition) recognition.stop();
      resetState();
    }
  }, [resetState]);

  const startListening = useCallback(() => {
    if (isListening || isProcessingRef.current) return;

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
    setIsListening(true);
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
        setFinalTranscript(prev => prev + " " + final);
      }
      if(timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
         if (recognition) recognition.stop();
      }, 2500); // Stop after 2.5s of silence
    };

    recognition.onend = () => {
       if (isProcessingRef.current) return;
       setIsListening(false);
       isProcessingRef.current = true;
       setState('processing');
    };
    
    recognition.onerror = (event: any) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
            toast({ variant: 'destructive', title: 'Speech Error', description: `Could not process audio. Error: ${event.error}` });
        }
        handleOpenChange(false);
    };

  }, [isListening, toast, user, router, handleOpenChange]);
  
  useEffect(() => {
    if (isOpen && state === 'idle') {
        startListening();
    }
  }, [isOpen, state, startListening]);

  const placeOrder = useCallback(async () => {
    const medsToOrder = foundMedicines.length > 0 ? foundMedicines : suggestedMedicine ? [suggestedMedicine] : [];
    if (medsToOrder.length === 0) return;
    
    setState('ordering');

    if (!user || user.isGuest || !location || location.includes("No address")) {
      toast({ variant: 'destructive', title: 'Cannot place order', description: 'User or location is missing.' });
      handleOpenChange(false);
      return;
    }

    const subtotal = medsToOrder.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;

    try {
        const orderData = {
            userId: user.id,
            cart: medsToOrder.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
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
  }, [user, location, toast, router, handleOpenChange, foundMedicines, suggestedMedicine]);

  useEffect(() => {
    if (state === 'processing' && finalTranscript) {
      // **THE FIX**: Trim trailing spaces and dots from the final transcript
      const cleanedTranscript = finalTranscript.trim().replace(/\.$/, '').trim();
      if (!cleanedTranscript) {
          handleOpenChange(false);
          return;
      }
      
      const words = cleanedTranscript.toLowerCase().split(/\s*,\s*|\s+and\s+/).map(s => s.trim()).filter(Boolean);
      
      const found: FoundMedicine[] = [];
      let bestMatch: { product: Product, distance: number } | null = null;

      words.forEach(word => {
          let minDistance = Infinity;
          let closestProduct: Product | null = null;
          
          productMap.forEach(product => {
              const distance = levenshtein(word, product.name.toLowerCase());
              if (distance < minDistance) {
                  minDistance = distance;
                  closestProduct = product;
              }
          });

          // If a very close match is found (e.g., Levenshtein distance <= 2)
          if (closestProduct && minDistance <= 2) {
              // Exact match or very close spelling
              if (minDistance === 0) {
                  if (!found.some(f => f.id === closestProduct!.id)) {
                      found.push({ ...closestProduct, quantity: 1 });
                  }
              } else {
                // Potential misspelling, save it for suggestion
                if (!bestMatch || minDistance < bestMatch.distance) {
                    bestMatch = { product: closestProduct, distance: minDistance };
                }
              }
          }
      });
      
      if (found.length > 0) {
        setFoundMedicines(found);
        setState('confirming');
      } else if (bestMatch) {
          setSuggestedMedicine({ ...bestMatch.product, quantity: 1 });
          setState('suggesting');
      } else {
        toast({
          variant: "destructive",
          title: "Medicine Not Found",
          description: `We couldn't find any items for: ${cleanedTranscript}. Please try again.`,
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

  const handleSuggestionConfirm = () => {
    if (suggestedMedicine) {
      setFoundMedicines([suggestedMedicine]);
      setState('confirming');
    }
  }

  const getStateContent = () => {
      switch (state) {
        case 'listening':
            return {
                icon: null,
                title: "Listening...",
                description: "Tell me the names of the medicines you need...",
                customBody: (
                     <div className="flex flex-col items-center justify-center h-full">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="my-8"
                        >
                            <Mic className="h-20 w-20 text-fuchsia-500" />
                        </motion.div>
                         {transcript && (
                            <p className="text-lg italic text-muted-foreground mt-4 text-center">"{transcript}"</p>
                        )}
                    </div>
                ),
                footer: null
            };
        case 'suggesting':
             return {
                icon: <Bot className="h-12 w-12 text-teal-500" />,
                title: `Did you mean ${suggestedMedicine?.name}?`,
                description: `You said: "${finalTranscript.trim()}"`,
                customBody: null,
                footer: (
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>No, Cancel</Button>
                        <Button onClick={handleSuggestionConfirm}>Yes, Order</Button>
                    </div>
                )
             }
        case 'confirming':
        case 'ordering':
            const medsToShow = foundMedicines.length > 0 ? foundMedicines : suggestedMedicine ? [suggestedMedicine] : [];
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
                            {medsToShow.map((med, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-foreground">{med.name}</span>
                                    <span className="font-mono text-right">₹{med.price.toFixed(2)}</span>
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
            icon: <Bot className="h-12 w-12 text-teal-500" />,
            title: "Voice Order",
            description: "Click the button to start.",
            customBody: null,
            footer: <Button onClick={startListening}>Start Listening</Button>
        };
      }
  }

  const content = getStateContent();

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50">
        <Button size="icon" className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-br from-fuchsia-600 to-purple-700" onClick={() => handleOpenChange(true)}>
            <Mic className="h-8 w-8"/>
        </Button>
      </div>

      <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
         <div className="flex flex-col h-full text-center p-6 bg-background">
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-8 min-h-[350px]">
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
