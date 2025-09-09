
'use client';

import { Suspense, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
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

// Wrapper component to handle Agora client initialization
function VideoCallWrapper() {
    const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);
    return (
        <AgoraRTCProvider client={client}>
            <VideoCallContent />
        </AgoraRTCProvider>
    );
}

export default function VideoCallPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <VideoCallWrapper />
        </Suspense>
    )
}
