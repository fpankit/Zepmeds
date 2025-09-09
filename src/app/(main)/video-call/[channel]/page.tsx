
'use client';

import { Suspense, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { AgoraRTCProvider } from 'agora-rtc-react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useParams, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

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

// Wrapper component to handle Agora client initialization
function VideoCallWrapper() {
    const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);
    const params = useParams();
    const searchParams = useSearchParams();
    const channelName = params.channel as string;
    const patientId = searchParams.get('patientId');
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '3b649d7a9006490292cd9d82534a6a91';
    const token = null;

    return (
        <AgoraRTCProvider client={client}>
             <AgoraVideoPlayer 
                appId={appId} 
                channelName={channelName} 
                token={token} 
                patientId={patientId}
            />
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
