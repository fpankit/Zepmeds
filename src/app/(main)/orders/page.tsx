
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { History, ArrowRight, PackageSearch, QrCode, Box } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface Order {
  id: string;
  orderDate: {
    seconds: number;
    nanoseconds: number;
  };
  total: number;
  status: string;
  cart: { name: string }[];
}

const OrderCardSkeleton = () => (
    <Card>
        <CardContent className="p-4">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-full mt-3" />
        </CardContent>
    </Card>
);

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.isGuest) {
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const q = query(
              collection(db, "orders"),
              where("userId", "==", user.id),
              orderBy("orderDate", "desc")
            );

            const querySnapshot = await getDocs(q);
            const fetchedOrders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Order));
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching orders: ", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchOrders();

  }, [user, authLoading, router]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status.toLowerCase() === filter);
  }, [orders, filter]);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'delivered': return 'bg-green-500';
        case 'order confirmed': return 'bg-blue-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-yellow-500';
    }
  }
  
  const noOrdersContent = (
      <Card className="text-center p-10 mt-6">
        <PackageSearch className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">No Orders Found</h3>
        <p className="text-muted-foreground">You don't have any {filter !== 'all' ? filter : ''} orders.</p>
        {filter !== 'all' && (
             <Button variant="link" onClick={() => setFilter('all')}>View all orders</Button>
        )}
      </Card>
  );

  if (user?.isGuest) {
      return (
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
           <div className="flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Order History</h1>
                <p className="text-muted-foreground">View all your past orders.</p>
              </div>
            </div>
            <Card className="text-center p-10">
                <h3 className="text-xl font-semibold">Login to View Orders</h3>
                <p className="text-muted-foreground">Please log in to see your order history.</p>
                <Button asChild className="mt-4">
                    <Link href="/login">Login</Link>
                </Button>
            </Card>
        </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground">View all your past orders.</p>
        </div>
      </div>
      
       <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
       </Tabs>


      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : filteredOrders.length === 0 ? (
            noOrdersContent
        ) : (
          filteredOrders.map(order => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm font-semibold">#{order.id.substring(0, 8)}</p>
                    </div>
                     <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>

                <div className="mt-4 space-y-2">
                     <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold">{format(new Date(order.orderDate.seconds * 1000), 'PPP')}</p>
                     </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-semibold">₹{order.total.toFixed(2)}</p>
                     </div>
                </div>

                 <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Items</p>
                    <p className="text-sm font-medium truncate">
                        {order.cart.map(item => item.name).join(', ')}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 gap-2 mt-4">
                     <Button asChild variant="outline" className="w-full">
                        <Link href={`/order-status?orderId=${order.id}`}>
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    {order.status.toLowerCase() === 'delivered' && (
                        <div className="grid grid-cols-2 gap-2">
                             <Button asChild variant="secondary" className="w-full">
                                <Link href={`/scan-package?orderId=${order.id}`}>
                                    <Box className="mr-2 h-4 w-4" />
                                    Scan Package
                                </Link>
                            </Button>
                            <Button asChild variant="default" className="w-full">
                                <Link href="/verify-medicine">
                                    <QrCode className="mr-2 h-4 w-4" />
                                    Verify Medicine
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
