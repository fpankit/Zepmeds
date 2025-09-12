
import {NextRequest, NextResponse} from 'next/server';
import crypto from 'crypto';

function generateZegoToken(
  appId: number,
  serverSecret: string,
  roomId: string,
  userId: string,
  expireInSeconds: number
): string {
  const now = Math.floor(new Date().getTime() / 1000);
  const expire = now + expireInSeconds;

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
    nonce: String(crypto.randomBytes(8).readBigInt64BE()),
    ctime: now,
    expire: expire,
    payload: JSON.stringify(payloadObject),
  };

  const tokenJson = JSON.stringify(tokenInfo);
  
  // Encrypt the token JSON
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', serverSecret, iv);
  const encrypted = Buffer.concat([cipher.update(tokenJson), cipher.final()]);

  // Construct the final token buffer
  // Format: expiration_time (4 bytes) + iv_length (2 bytes) + iv + ciphertext_length (2 bytes) + ciphertext
  const tokenBuffer = Buffer.alloc(4 + 2 + 16 + 2 + encrypted.length);
  let offset = 0;
  
  tokenBuffer.writeUInt32BE(expire, offset);
  offset += 4;
  
  tokenBuffer.writeUInt16BE(iv.length, offset);
  offset += 2;
  
  iv.copy(tokenBuffer, offset);
  offset += iv.length;

  tokenBuffer.writeUInt16BE(encrypted.length, offset);
  offset += 2;

  encrypted.copy(tokenBuffer, offset);

  // The final token is base64 encoded and prefixed with '04'
  const token = '04' + tokenBuffer.toString('base64');
  
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
