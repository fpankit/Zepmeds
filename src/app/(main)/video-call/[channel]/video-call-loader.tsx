
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
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
  channelName: string;
  token: string | null;
}

// This component acts as a bridge, reading credentials and passing them 
// to the client-only video component.
export function VideoCallLoader({ channelName, token }: VideoCallLoaderProps) {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

  if (!appId) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
                Video call service is not configured correctly. The Agora App ID is missing. Please contact support.
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <VideoCallClient
      appId={appId}
      channelName={channelName}
      token={token}
    />
  );
}
