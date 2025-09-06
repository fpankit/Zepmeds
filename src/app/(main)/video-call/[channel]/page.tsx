
'use server';

import { VideoCallLoader } from './video-call-loader';

export default async function VideoCallPage({ params }: { params: { channel: string } }) {
  const channelName = params.channel;
  
  // The App ID will be read directly on the client.
  // The token is null for testing mode.
  return (
    <VideoCallLoader
      channelName={channelName}
      token={null}
    />
  );
}
