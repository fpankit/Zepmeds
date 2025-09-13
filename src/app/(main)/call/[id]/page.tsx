
'use client';

import { VideoCallContent } from "@/components/features/video-call-content";
import { useParams } from "next/navigation";

// This is now a Client Component to better manage state and interactions.
export default function CallPage() {
  const params = useParams();
  const roomId = params.id as string;

  // VideoCallContent is a Client Component that receives the roomId as a prop.
  return <VideoCallContent roomId={roomId} />;
}

    