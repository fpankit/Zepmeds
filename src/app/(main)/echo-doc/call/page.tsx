
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const EchoDocCallContent = dynamic(
    () => import('@/components/features/echo-doc-call-content').then(mod => mod.EchoDocCallContent),
    { 
        ssr: false,
        loading: () => (
            <div className="p-4 space-y-4 h-screen bg-background">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }
);

export default function EchoDocCallPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EchoDocCallContent />
        </Suspense>
    )
}
