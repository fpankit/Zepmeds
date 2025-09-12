import {NextRequest, NextResponse} from 'next/server';

function generateZegoToken(
  appId: number,
  serverSecret: string,
  roomId: string,
  userId: string,
  expireInSeconds: number
): string {
  const effectiveTimeInSeconds = expireInSeconds;
  const payloadObject = {
    room_id: roomId,
    privilege: {
      1: 1, // loginRoom
      2: 1, // publishStream
    },
    stream_id_list: null,
  };

  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: String(new Date().getTime()),
    ctime: Math.floor(new Date().getTime() / 1000),
    expire: Math.floor(new Date().getTime() / 1000) + effectiveTimeInSeconds,
    payload: JSON.stringify(payloadObject),
  };

  const tokenJson = JSON.stringify(tokenInfo);
  
  const iv = require('crypto').randomBytes(16);
  const cipher = require('crypto').createCipheriv('aes-256-cbc', serverSecret, iv);

  let encrypted = cipher.update(tokenJson, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const token = '04' + Buffer.from(iv.toString('hex') + encrypted, 'hex').toString('base64');
  
  return token;
}


export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const userId = searchParams.get('userId');
  const roomId = searchParams.get('roomId');

  if (!userId || !roomId) {
    return NextResponse.json(
      {error: 'userId and roomId are required'},
      {status: 400}
    );
  }

  const appId = parseInt(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID!, 10);
  const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET!;

  if (isNaN(appId) || !serverSecret) {
    console.error("ZegoCloud environment variables not set. App ID:", process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID, "Server Secret exists:", !!serverSecret);
    return NextResponse.json(
      {error: 'ZegoCloud App ID or Server Secret is not configured'},
      {status: 500}
    );
  }
   if (serverSecret.length !== 32) {
      return NextResponse.json(
        {error: 'ZegoCloud Server Secret must be 32 characters long.'},
        {status: 500}
      );
   }

  const expirationTimeInSeconds = 3600; // 1 hour
  const token = generateZegoToken(
    appId,
    serverSecret,
    roomId,
    userId,
    expirationTimeInSeconds
  );

  return NextResponse.json({token});
}
