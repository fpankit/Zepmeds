
'use client';

import { VideoCallContent } from "@/components/features/video-call-content";

// This tells Next.js to render this page dynamically, skipping static generation.
export const dynamic = 'force-dynamic';

// This is now a Client Component to better manage state and interactions.
export default function CallPage() {
  
  // VideoCallContent no longer needs roomId, as it's handled internally.
  // The dynamic route is still useful for creating a unique URL for each call instance.
  return <VideoCallContent />;
}
