
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const VideoCallClient = dynamic(
  () => import('./video-call-client').then(mod => mod.VideoCallClient),
  { 
    ssr: false,
    loading: () => (
      <div className="relative flex h-screen flex-col items-center justify-center bg-black p-4">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  }
);

interface VideoCallLoaderProps {
  appId: string;
  channelName: string;
  token: string;
}

export function VideoCallLoader({ appId, channelName, token }: VideoCallLoaderProps) {
  return (
    <VideoCallClient
      appId={appId}
      channelName={channelName}
      token={token}
    />
  );
}
