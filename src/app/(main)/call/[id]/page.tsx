"use client";

import React from "react";
import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

// Dynamically import the call content to ensure it's client-side only
const VideoCallContent = dynamic(() => import('@/components/features/video-call-content').then(mod => mod.VideoCallContent), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="ml-2">Loading Call...</p>
    </div>
  )
});


export default function CallPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  
  return <VideoCallContent roomId={roomId} />;
}
