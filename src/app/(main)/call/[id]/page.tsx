import { VideoCallContent } from "@/components/features/video-call-content";

// This is now a Server Component. It can directly access params.
export default function CallPage({ params }: { params: { id: string } }) {
  const roomId = params.id;

  // VideoCallContent is a Client Component that receives the roomId as a prop.
  return <VideoCallContent roomId={roomId} />;
}
