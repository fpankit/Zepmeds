
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { History, ArrowRight, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.isGuest) {
      router.push('/login');
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.id),
      orderBy("orderDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(fetchedOrders);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'delivered': return 'bg-green-500';
        case 'order confirmed': return 'bg-blue-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-yellow-500';
    }
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

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : orders.length === 0 ? (
          <Card className="text-center p-10">
            <PackageSearch className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Orders Yet</h3>
            <p className="text-muted-foreground">You haven't placed any orders with us yet.</p>
            <Button asChild className="mt-4">
              <Link href="/home">Start Shopping</Link>
            </Button>
          </Card>
        ) : (
          orders.map(order => (
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
                
                 <Button asChild variant="outline" className="w-full mt-4">
                    <Link href={`/order-status?orderId=${order.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
