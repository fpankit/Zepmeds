
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';
import { LiveTrackingMap } from './live-tracking-map';
import { Bike, Check, ChevronRight, Loader2, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';


const riderDetails = {
    name: "Rohan Sharma",
    rating: 4.8,
    phone: "+91 1234567890",
    image: "https://picsum.photos/200/200?random=31",
    dataAiHint: "person portrait",
    location: { lat: 28.50, lng: 77.05 } // Simulated rider location
}

// Simulated user location for demonstration. In a real app, this would come from the order details.
const userLocation = { lat: 28.4595, lng: 77.0266 };


export function OrderStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  
  useEffect(() => {
    if (!orderId) {
        setIsLoading(false);
        return;
    }
    
    const orderDocRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(orderDocRef, (doc) => {
        if (doc.exists()) {
            const orderData = doc.data();
            setOrder({ id: doc.id, ...orderData });
        } else {
            console.error("Order not found");
            setOrder(null);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }
  
  if (!order) {
      return (
           <div className="flex h-screen w-full items-center justify-center text-center p-4">
              <p>Order not found. Please check the order ID and try again.</p>
          </div>
      )
  }
  
  const totalItems = order.cart.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-4">
        
        <Card className="overflow-hidden">
            <CardContent className="p-4 grid grid-cols-2 gap-4">
                <div className='space-y-2'>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-800/20 dark:text-green-300">
                        <Check className="h-4 w-4" />
                        On time
                    </div>
                    <p className="text-muted-foreground text-sm">Arriving in</p>
                    <p className="text-3xl font-bold text-purple-500">10 mins</p>
                    <p className="text-md font-semibold">Your order is getting packed</p>
                </div>
                 <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center justify-center text-center dark:bg-blue-900/20">
                    <p className="font-bold text-blue-800 dark:text-blue-300">Switch to 10% Savings</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">with HDFC Bank NeuCard</p>
                    <Button size="sm" className="mt-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs h-7">Apply Now</Button>
                 </div>
            </CardContent>
            <div className='border-t border-border p-4 flex justify-between items-center'>
                <div className='flex items-center gap-3'>
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <MapPin className='h-5 w-5 text-muted-foreground' />
                    </div>
                    <p className='font-semibold'>Track your order</p>
                </div>
                <Button variant="destructive" className='bg-pink-500 hover:bg-pink-600' onClick={() => setShowMap(!showMap)}>
                   {showMap ? 'Hide Map' : 'View Map'}
                </Button>
            </div>
        </Card>

        {showMap && (
            <Card>
                <CardContent className='p-4'>
                    <LiveTrackingMap riderLocation={riderDetails.location} userLocation={userLocation} />
                </CardContent>
            </Card>
        )}

        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={riderDetails.image} alt={riderDetails.name} data-ai-hint={riderDetails.dataAiHint} />
                        <AvatarFallback><Bike /></AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold">{riderDetails.name}</p>
                        <p className="text-sm text-muted-foreground">Delivery Partner</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{riderDetails.rating}</span>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardContent className='p-4'>
                <button className='w-full flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 flex items-center justify-center rounded-full bg-muted'>
                            🛍️
                        </div>
                        <p className='font-semibold'>{totalItems} items</p>
                        <span className='text-sm text-green-500 font-bold'>· ₹75 saved</span>
                    </div>
                    <ChevronRight className='h-5 w-5 text-muted-foreground'/>
                </button>
            </CardContent>
        </Card>

    </div>
  );
}
