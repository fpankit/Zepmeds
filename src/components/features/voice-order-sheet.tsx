
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
import { Mic, Loader2, Bot, MapPin, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

type VoiceSheetState = 'idle' | 'permission' | 'listening' | 'processing' | 'results' | 'error';

export function VoiceOrderSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<VoiceSheetState>('idle');
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [medicines, setMedicines] = useState<string[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { addToCart, productMap } = useCart();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetState = useCallback(() => {
    setState('idle');
    setTranscript("");
    setFinalTranscript("");
    setMedicines([]);
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
      setState('error');
      return;
    }

    setState('permission');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (response.ok) {
            const data = await response.json();
            setLocation(data.display_name || 'Current Location');
          } else {
             setLocation('Current Location (Details unavailable)');
          }
        } catch {
             setLocation('Current Location (Details unavailable)');
        }
        
        // Start recognition after location is fetched
        setTranscript("");
        setFinalTranscript("");
        setState('listening');
        recognition.start();

      },
      (error) => {
        toast({ variant: 'destructive', title: 'Location Access Denied', description: 'Please enable location to order medicines.' });
        setState('error');
      }
    );

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
      // Reset timeout on new speech
      if(timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
         recognition.stop();
      }, 3000); // Stop after 3s of silence
    };

    recognition.onend = () => {
      if (state !== 'processing') {
         setState(prev => (prev === 'listening' ? 'processing' : prev));
      }
    };
    
    recognition.onerror = (event: any) => {
        toast({ variant: 'destructive', title: 'Speech Error', description: `Could not process audio. Error: ${event.error}` });
        setState('error');
    };

  }, [toast, state]);

  useEffect(() => {
    if (state === 'processing' && finalTranscript) {
      // Basic NLP: Split by "and" or common separators, look for keywords
      const words = finalTranscript.toLowerCase().replace(/and/g, ',').split(',').map(s => s.trim()).filter(Boolean);
      
      const foundMedicines: string[] = [];
      const productNames = Array.from(productMap.keys()).map(k => k.toLowerCase());

      words.forEach(word => {
          productNames.forEach(productName => {
              if (productName.includes(word) || word.includes(productName)) {
                  const product = productMap.get(Array.from(productMap.keys()).find(k => k.toLowerCase() === productName)!)!;
                  if(!foundMedicines.includes(product.name)) {
                      foundMedicines.push(product.name);
                      addToCart({ ...product, quantity: 1, isRx: true });
                  }
              }
          })
      });

      if (foundMedicines.length === 0 && words.length > 0) {
        // If no matches, add the raw recognized words as urgent items
        words.forEach(word => {
            if (!foundMedicines.includes(word)) {
                foundMedicines.push(word);
                addToCart({ id: `urgent-${word.replace(/\s+/g, '-')}`, name: word, price: 0, quantity: 1, isRx: true });
            }
        });
      }
      
      setMedicines(foundMedicines);
      setState('results');
    }
  }, [state, finalTranscript, addToCart, productMap]);

  const getStateContent = () => {
      switch (state) {
          case 'idle':
              return {
                  icon: <Bot className="h-16 w-16 text-primary" />,
                  title: "Voice Order",
                  description: "Tap the mic and say the medicines you need. We'll find them and add them to your cart for an urgent delivery.",
                  footer: <Button className="w-full" onClick={startListening}>Start Listening</Button>
              };
          case 'permission':
              return {
                  icon: <Loader2 className="h-16 w-16 text-primary animate-spin" />,
                  title: "Getting Ready...",
                  description: "Please allow microphone and location access. Fetching your location for faster delivery.",
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
                description: "Finding the medicines you asked for. Please wait a moment.",
                footer: null
            };
        case 'results':
            return {
                icon: <Search className="h-16 w-16 text-green-500" />,
                title: "Medicines Added to Cart",
                description: `We've added ${medicines.length} item(s) to your cart for an urgent order. Please review your cart to complete the purchase.`,
                footer: (
                    <div className="w-full space-y-2">
                        <Button className="w-full" onClick={() => router.push('/cart')}>Go to Cart</Button>
                        <Button variant="outline" className="w-full" onClick={resetState}>Order More</Button>
                    </div>
                )
            };
        case 'error':
             return {
                icon: <Bot className="h-16 w-16 text-destructive" />,
                title: "Something went wrong",
                description: "We couldn't process your request. Please try again or use the search bar.",
                footer: <Button className="w-full" onClick={startListening}>Try Again</Button>
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
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
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
                        <h2 className="text-2xl font-bold">{content?.title}</h2>
                        <p className="text-muted-foreground">{content?.description}</p>
                     </motion.div>
                  </AnimatePresence>

                  {state === 'listening' && transcript && (
                      <p className="text-lg italic text-foreground mt-4">"{transcript}"</p>
                  )}
                  {state === 'results' && medicines.length > 0 && (
                      <div className="w-full max-w-sm pt-4">
                        <ul className="list-disc list-inside text-left bg-muted p-3 rounded-md">
                            {medicines.map((med, i) => <li key={i}>{med}</li>)}
                        </ul>
                      </div>
                  )}

              </div>
              
              {location && (
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-2 border-t pt-4">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">Delivering to: {location}</span>
                  </div>
              )}

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

    