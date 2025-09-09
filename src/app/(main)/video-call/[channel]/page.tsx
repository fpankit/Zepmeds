
'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the main content to ensure it only runs on the client-side
const AgoraVideoPlayer = dynamic(
    () => import('@/components/features/agora-video-player').then(mod => mod.AgoraVideoPlayer),
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
            <AgoraVideoPlayer />
        </Suspense>
    )
}
