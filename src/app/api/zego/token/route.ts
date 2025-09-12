import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Generates a ZegoCloud v2 token manually.
 * This is the required format for the version of the SDK being used.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const roomId = searchParams.get('roomId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  
  if (!roomId) {
    return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
  }

  const appId = Number(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID);
  const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET;

  if (!appId || isNaN(appId)) {
    console.error('ZegoCloud App ID is not configured or invalid.');
    return NextResponse.json({ error: 'Missing Zego App ID on the server.' }, { status: 500 });
  }

  if (!serverSecret || serverSecret.length !== 32) {
    console.error('ZegoCloud Server Secret is not configured or is not 32 characters long.');
    return NextResponse.json({ error: 'Invalid Zego Server Secret on the server. It must be 32 characters long.' }, { status: 500 });
  }

  const effectiveTimeInSeconds = 3600; // Token valid for 1 hour
  const createTime = Math.floor(Date.now() / 1000);
  const expireTime = createTime + effectiveTimeInSeconds;
  const nonce = crypto.randomBytes(8).toString('hex');
  
  const payloadObject = {
    room_id: roomId,
    privilege: {
      "1": 1, // loginRoom: 1 = allow
      "2": 1, // publishStream: 1 = allow
    },
    stream_id_list: null,
    user_id: userId,
    app_id: appId,
  };

  const payload = JSON.stringify(payloadObject);

  const tokenInfo = {
    ver: 2,
    hash: 1, // SHA-256
    nonce: nonce,
    ctime: createTime,
    expire: expireTime,
    payload: payload,
  };

  try {
    const key = Buffer.from(serverSecret, 'utf8');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(JSON.stringify(tokenInfo), 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const result = Buffer.from(iv).toString('hex') + encrypted;
    const token = '02' + Buffer.from(result).toString('base64');

    return NextResponse.json({ token });

  } catch (error: any) {
    console.error('Error generating Zego token:', error);
    return NextResponse.json({ error: 'Failed to generate Zego token: ' + error.message }, { status: 500 });
  }
}
