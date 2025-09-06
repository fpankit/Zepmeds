
"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function OrderStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderStatusContent />
        </Suspense>
    )
}
