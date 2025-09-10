
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const HundredMSVideoPlayer = dynamic(
    () => import('@/components/features/100ms-video-player').then(mod => mod.HundredMSVideoPlayer),
    { 
        ssr: false,
        loading: () => (
            <div className="flex h-screen w-full flex-col bg-gray-900">
                <header className="flex h-16 items-center justify-between border-b border-gray-700 px-4 text-white">
                    <Skeleton className="h-8 w-48" />
                    <div className="w-8" />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:flex-row">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                </main>
                 <footer className="flex h-20 items-center justify-center gap-4 border-t border-gray-700 bg-gray-800">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                </footer>
            </div>
        )
    }
);


export default function VideoCallPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-900"><Loader2 className="h-8 w-8 animate-spin text-white"/></div>}>
            <HundredMSVideoPlayer />
        </Suspense>
    )
}
