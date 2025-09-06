
'use server';

import { VideoCallLoader } from './video-call-loader';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const tempToken = "007eJxTYPDi9NULmvAh5hO3vPHGxG+138/NNZ7DdFAs9NO9xZoR3z8qMBhaJlsYpqZYJiebJ5qkmaUlmhgYpaWmmKZYJJpbJieaTji3O6MhkJFh/TMvJkYGCATxeRiiUgtyU1OKwzJTUvMZGACzDSS+";


export default async function VideoCallPage({ params }: { params: { channel: string } }) {
  const channelName = params.channel;
  
  if (!appId) {
     return (
        <div className="container mx-auto p-4 flex items-center justify-center h-screen">
          <p className="text-red-500 text-center">Video call service is not configured correctly. Please contact support.</p>
        </div>
     )
  }

  return (
    <VideoCallLoader
      appId={appId}
      channelName={channelName}
      token={tempToken}
    />
  );
}
