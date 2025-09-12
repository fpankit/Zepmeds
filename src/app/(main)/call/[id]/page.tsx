'use client';

import { VideoCallContent } from "@/components/features/video-call-content";

// This is now a Client Component to better manage state and interactions.
export default function CallPage({ params }: { params: { id: string } }) {
  const { id: roomId } = params;

  // VideoCallContent is a Client Component that receives the roomId as a prop.
  return <VideoCallContent roomId={roomId} />;
}
