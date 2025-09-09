
'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { AgoraRTCProvider } from 'agora-rtc-react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Dynamically import the main content to ensure it only runs on the client-side
const VideoCallContent = dynamic(
    () => import('@/components/features/video-call-content').then(mod => mod.VideoCallContent),
    {
        ssr: false,
        loading: () => (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
);


export default function VideoCallPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <VideoCallContent />
        </Suspense>
    )
}
