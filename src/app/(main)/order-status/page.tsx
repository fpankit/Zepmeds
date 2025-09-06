
"use client";

import { Suspense } from 'react';
import { OrderStatusContent } from '@/components/features/order-status-content';

export default function OrderStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderStatusContent />
        </Suspense>
    )
}

    