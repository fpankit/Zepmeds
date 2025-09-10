
"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const OrderStatusContent = dynamic(
    () => import('@/components/features/order-status-content').then(mod => mod.OrderStatusContent),
    { 
        ssr: false,
        loading: () => (
            <div className="p-4 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }
);

function OrderStatusHeader() {
    const router = useRouter();
    return (
         <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold ml-4">Order Status</h1>
        </header>
    )
}

export default function OrderStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="flex flex-col h-screen">
                <OrderStatusHeader />
                <main className="flex-1 overflow-y-auto">
                    <OrderStatusContent />
                </main>
            </div>
        </Suspense>
    )
}
