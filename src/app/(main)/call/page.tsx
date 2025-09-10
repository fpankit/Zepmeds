
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const VideoCallContent = dynamic(
    () => import('@/components/features/video-call-content').then(mod => mod.VideoCallContent),
    { 
        ssr: false,
        loading: () => (
            <div className="p-4 space-y-4 h-screen bg-black">
                <div className="relative w-full aspect-video bg-muted rounded-lg"></div>
                <div className="absolute inset-0 w-32 h-48 bg-muted rounded-lg border-2 border-white"></div>
                 <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/50">
                    <div className="flex justify-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <Skeleton className="h-14 w-14 rounded-full" />
                    </div>
                </div>
            </div>
        )
    }
);

export default function VideoCallPage() {
    return (
        <Suspense fallback={<div>Loading Call...</div>}>
            <VideoCallContent />
        </Suspense>
    )
}
