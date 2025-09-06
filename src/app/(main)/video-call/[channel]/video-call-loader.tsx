
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

// Dynamically import the video call client component to ensure it's only loaded on the client-side.
// The Agora SDK, which it uses, needs access to browser-specific APIs like `window`.
const VideoCallClient = dynamic(
  () => import('./video-call-client').then(mod => mod.VideoCallClient),
  { 
    ssr: false, // This is crucial to prevent server-side rendering
    loading: () => (
      // Display a skeleton loader while the component is being loaded
      <div className="relative flex h-screen flex-col bg-black">
        <Skeleton className="w-full flex-1" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-14 w-14 rounded-full" />
        </div>
      </div>
    ),
  }
);

interface VideoCallLoaderProps {
  appId: string;
  channelName: string;
  token: string | null;
}

// This component acts as a bridge, receiving server-generated props 
// and passing them to the client-only video component.
export function VideoCallLoader({ appId, channelName, token }: VideoCallLoaderProps) {
  return (
    <VideoCallClient
      appId={appId}
      channelName={channelName}
      token={token}
    />
  );
}
