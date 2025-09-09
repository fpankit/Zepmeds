
'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { AgoraRTCProvider } from 'agora-rtc-react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Dynamically import the AgoraVideoPlayer to ensure it only runs on the client-side
const AgoraVideoPlayer = dynamic(
    () => import('@/components/features/agora-video-player').then(mod => mod.AgoraVideoPlayer),
    { 
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
);

const PatientProfile = dynamic(
    () => import('@/components/features/patient-profile').then(mod => mod.PatientProfile),
    {
        ssr: false,
        loading: () => (
            <div className='p-4 space-y-4'>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }
);

// Create the client instance inside the component that runs client-side
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

function VideoCallContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const channelName = params.channel as string;
    const patientId = searchParams.get('patientId');

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '3b649d7a9006490292cd9d82534a6a91';
    const token = null; // Should be fetched from a secure token server in production

    return (
        <AgoraRTCProvider client={client}>
            <div className="flex h-screen w-full bg-black text-white">
                {/* Main Video Grid */}
                <main className="flex-1 flex flex-col relative">
                    {appId ? (
                        <AgoraVideoPlayer appId={appId} channelName={channelName} token={token} />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p>Agora App ID is not configured.</p>
                        </div>
                    )}
                </main>

                {/* Sidebar with Patient Details */}
                <aside className="w-80 hidden md:block bg-gray-900 border-l border-gray-800 p-4">
                    {patientId && <PatientProfile patientId={patientId} />}
                </aside>
            </div>
        </AgoraRTCProvider>
    );
}

export default function VideoCallPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <VideoCallContent />
        </Suspense>
    )
}
