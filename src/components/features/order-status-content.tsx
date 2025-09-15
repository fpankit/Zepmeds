
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';
import { Bike, Check, ChevronDown, ChevronUp, Loader2, MapPin, MessageSquare, Phone, Star, Gift, Bell, Download, HelpCircle, AlertCircle, QrCode, Box, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';

const LiveTrackingMap = dynamic(() => import('./live-tracking-map').then(mod => mod.LiveTrackingMap), {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full rounded-md" />
});


const riderDetails = {
    name: "Rohan Sharma",
    rating: 4.8,
    phone: "+91 1234567890",
    image: "https://picsum.photos/200/200?random=31",
    dataAiHint: "person portrait",
}

// Simulated user location for demonstration. In a real app, this would come from the order details.
const userLocation = { lat: 28.4595, lng: 77.0266 };

const statusConfig = {
    "order confirmed": { progress: 25, eta: 10 * 60, message: "Your order is getting packed" },
    "out for delivery": { progress: 50, eta: 8 * 60, message: "Your rider is on the way" },
    "rider assigned": { progress: 50, eta: 8 * 60, message: "Rider Assigned" }, // Added this status
    "arrived at location": { progress: 85, eta: 2 * 60, message: "Your rider has arrived" },
    "delivered": { progress: 100, eta: 0, message: "Enjoy your order!" },
    "cancelled": { progress: 0, eta: 0, message: "This order has been cancelled." }
};


export function OrderStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();
  const { toast } = useToast();

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isItemsOpen, setIsItemsOpen] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [riderLocation, setRiderLocation] = useState({ lat: 28.50, lng: 77.05 }); // Default simulated location
  
  const fetchOrder = useCallback(async () => {
    if (!orderId) {
        setIsLoading(false);
        return;
    }
    
    setIsRefreshing(true);
    try {
        const orderDocRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(orderDocRef);
        if (docSnap.exists()) {
            const orderData = docSnap.data();
            setOrder({ id: docSnap.id, ...orderData });
             if (orderData.riderLocation) {
                setRiderLocation(orderData.riderLocation);
            }
             toast({ title: "Status Updated", description: "Your order status has been refreshed." });
        } else {
            console.error("Order not found");
            setOrder(null);
            toast({ variant: "destructive", title: "Order not found" });
        }
    } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch order status." });
    } finally {
        setIsLoading(false);
        setIsRefreshing(false);
    }
  }, [orderId, toast]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);
  
   useEffect(() => {
    if (order && order.status) {
      const currentStatusKey = order.status.toLowerCase() as keyof typeof statusConfig;
      const currentStatusInfo = statusConfig[currentStatusKey];
      
      if (currentStatusInfo) {
        setEtaSeconds(currentStatusInfo.eta);
      } else {
        setEtaSeconds(null); // No ETA for unknown statuses
      }
    }
  }, [order]);

  useEffect(() => {
    if (etaSeconds !== null && etaSeconds > 0) {
      const timer = setInterval(() => {
        setEtaSeconds(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [etaSeconds]);


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
              <div>
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-xl font-bold">Order Not Found</h2>
                <p className="mt-2 text-muted-foreground">Please check the order ID and try again.</p>
              </div>
          </div>
      )
  }
  
  const totalItems = order.cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const currentStatusKey = order.status.toLowerCase() as keyof typeof statusConfig;
  const currentStatusInfo = statusConfig[currentStatusKey] || { progress: 0, eta: null, message: order.status };
  
  const formatTime = (seconds: number | null) => {
      if (seconds === null || seconds < 0) return '0 min';
      const minutes = Math.floor(seconds / 60);
      return `${minutes} min`;
  };

  const getStatusDisplay = () => {
    if (currentStatusKey === 'delivered') {
        return (
            <div className='flex items-center gap-2'>
                <Check className="h-8 w-8 text-green-500" />
                <p className="text-3xl font-bold text-green-500">Delivered</p>
            </div>
        )
    }
    if (currentStatusKey === 'arrived at location' || (etaSeconds !== null && etaSeconds > 0 && etaSeconds <= 120)) {
         return <p className="text-3xl font-bold text-primary">Arriving Soon</p>
    }
    return <p className="text-3xl font-bold text-primary">{formatTime(etaSeconds)}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-4">
        
        <Card className="overflow-hidden">
            <CardContent className="p-4 grid grid-cols-2 gap-4">
                <div className='space-y-2'>
                     {currentStatusKey !== 'delivered' && currentStatusKey !== 'cancelled' && (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-800/20 dark:text-green-300">
                            <Check className="h-4 w-4" />
                            On time
                        </div>
                     )}
                     {currentStatusKey === 'cancelled' ? (
                        <>
                            <div className="text-5xl">😞</div>
                            <p className="text-2xl font-bold text-destructive">Order Cancelled</p>
                        </>
                     ) : (
                        <>
                           <p className="text-muted-foreground text-sm">
                                {currentStatusKey === 'delivered' ? 'Your order has been delivered.' : 'Arriving in'}
                            </p>
                            {getStatusDisplay()}
                        </>
                     )}
                    <p className="text-md font-semibold">
                        {currentStatusInfo.message}
                    </p>
                    {currentStatusKey === 'cancelled' && (
                        <Button className="mt-2" onClick={() => router.push('/home')}>Reorder</Button>
                    )}
                    {currentStatusKey === 'delivered' && (
                         <Button size="sm" className="mt-2 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground rounded-full text-xs h-8 px-4" onClick={() => router.push(`/scan-package?orderId=${order.id}`)}>
                            <Box className="mr-2 h-4 w-4" /> Verify Package
                        </Button>
                    )}
                </div>
                 <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center justify-center text-center dark:bg-blue-900/20">
                    <p className="font-bold text-blue-800 dark:text-blue-300">Switch to Zepmeds1 for extra discount</p>
                    <Button size="sm" className="mt-3 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground rounded-full text-xs h-7">Apply Now</Button>
                 </div>
            </CardContent>
            {currentStatusKey !== 'delivered' && currentStatusKey !== 'cancelled' && (
                <>
                <Progress value={currentStatusInfo.progress} className="h-1 bg-muted-foreground/20 rounded-none [&>*]:bg-green-500" />
                <div className='border-t border-border p-4 flex justify-between items-center'>
                    <div className='flex items-center gap-3'>
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <MapPin className='h-5 w-5 text-muted-foreground' />
                        </div>
                        <p className='font-semibold'>Track your order</p>
                    </div>
                    <Button variant="default" className='bg-primary hover:bg-primary/90' onClick={() => setShowMap(!showMap)}>
                    {showMap ? 'Hide Map' : 'View Map'}
                    </Button>
                </div>
                </>
            )}
        </Card>

        <AnimatePresence>
        {showMap && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <Card>
                    <CardContent className='p-4'>
                        <LiveTrackingMap riderLocation={riderLocation} userLocation={userLocation} />
                    </CardContent>
                </Card>
            </motion.div>
        )}
        </AnimatePresence>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Delivery Status</CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchOrder} disabled={isRefreshing}>
                    {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4"/>}
                </Button>
            </CardHeader>
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
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon"><Phone className="h-5 w-5"/></Button>
                    <Button variant="outline" size="icon"><MessageSquare className="h-5 w-5"/></Button>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">{riderDetails.rating}</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <Collapsible open={isItemsOpen} onOpenChange={setIsItemsOpen}>
            <CardContent className='p-4'>
                <CollapsibleTrigger className='w-full'>
                    <div className='w-full flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='h-8 w-8 flex items-center justify-center rounded-full bg-muted'>
                                🛍️
                            </div>
                            <p className='font-semibold'>{totalItems} items</p>
                        </div>
                        {isItemsOpen ? <ChevronUp className='h-5 w-5 text-muted-foreground'/> : <ChevronDown className='h-5 w-5 text-muted-foreground'/>}
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                         {order.cart.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <p>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></p>
                                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="flex justify-between items-center font-bold border-t border-dashed pt-2 mt-2">
                            <p>Total</p>
                            <p>₹{order.total.toFixed(2)}</p>
                        </div>
                    </div>
                </CollapsibleContent>
            </CardContent>
            </Collapsible>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Item Total</p>
                    <p>₹{order.subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Delivery Fee</p>
                    <p>₹{order.deliveryFee.toFixed(2)}</p>
                </div>
                 <div className="flex justify-between text-green-500">
                    <p>Discount</p>
                    <p>- ₹25.00</p>
                </div>
                <Separator className="my-2"/>
                <div className="flex justify-between font-bold text-base">
                    <p>Grand Total</p>
                    <p>₹{(order.total - 25).toFixed(2)}</p>
                </div>
            </CardContent>
            <CardContent className="border-t p-4 flex justify-between items-center">
                 <p className="text-sm text-muted-foreground">Paid using {order.paymentMethod}</p>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-muted-foreground">
                        <Download className="h-4 w-4 mr-2" /> Invoice
                    </Button>
                    <Button variant="outline" size="sm" className="text-muted-foreground">
                        <HelpCircle className="h-4 w-4 mr-2" /> Help
                    </Button>
                    <Button variant="destructive" size="sm">
                        <AlertCircle className="h-4 w-4 mr-2" /> Report
                    </Button>
                 </div>
            </CardContent>
        </Card>

        {/* Rewards Section */}
        <div className="space-y-4">
            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-lg bg-yellow-500/20'>
                            <Gift className="h-6 w-6 text-yellow-500"/>
                        </div>
                        <div>
                            <h3 className="font-semibold">Get 25% off on your next order</h3>
                            <p className="text-sm text-muted-foreground">Refer your friends &amp; start saving!</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">Refer Now</Button>
                </CardContent>
            </Card>
             <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-lg bg-red-500/20'>
                            <Bell className="h-6 w-6 text-red-500"/>
                        </div>
                        <div>
                            <h3 className="font-semibold">Get real-time delivery updates</h3>
                            <p className="text-sm text-muted-foreground">Turn on notifications to keep track</p>
                        </div>
                    </div>
                    <Switch />
                </CardContent>
            </Card>
        </div>

    </div>
  );
}
