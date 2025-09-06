
'use server';

import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { VideoCallLoader } from './video-call-loader';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

// This function will run on the server to securely generate a token
const generateToken = (channelName: string) => {
  if (!appId || !appCertificate) {
    console.error("Agora App ID or Certificate is not configured.");
    return null;
  }
  
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  // Generate the token
  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      0, // Uid is set to 0 to allow any user to join
      role,
      privilegeExpiredTs
    );
    return token;
  } catch (error) {
    console.error("Error generating Agora token:", error);
    return null;
  }
};


export default async function VideoCallPage({ params }: { params: { channel: string } }) {
  const channelName = params.channel;
  const token = generateToken(channelName);
  
  if (!appId || !token) {
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
      token={token}
    />
  );
}
