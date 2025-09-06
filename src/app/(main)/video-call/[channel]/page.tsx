
'use server';

import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { VideoCallClient } from './video-call-client';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

if (!appId || !appCertificate) {
  throw new Error('Agora App ID and Certificate are not set in environment variables.');
}

async function generateToken(channelName: string) {
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  const uid = 0; // The user ID. 0 means the server assigns one.

  if (!channelName) {
    return '';
  }

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId!,
      appCertificate!,
      channelName,
      uid,
      role,
      privilegeExpiredTs,
      privilegeExpiredTs
    );
    return token;
  } catch (error) {
    console.error('Error generating Agora token:', error);
    return '';
  }
}

export default async function VideoCallPage({ params }: { params: { channel: string } }) {
  const channelName = params.channel;
  const token = await generateToken(channelName);
  
  if (!appId) {
     return <div className="container mx-auto p-4">Agora App ID is not configured.</div>
  }

  return (
    <VideoCallClient
      appId={appId}
      channelName={channelName}
      token={token}
    />
  );
}
