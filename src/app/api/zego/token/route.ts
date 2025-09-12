import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a ZegoCloud v3 token.
 * This function manually constructs the token payload as specified in the ZegoCloud documentation.
 */
function generateZegoToken(appId: number, serverSecret: string, userId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const effectiveTimeInSeconds = 3600; // Token valid for 1 hour

    const payload = {
        app_id: appId,
        user_id: userId,
        nonce: uuidv4().replace(/-/g, ''),
        iat: now,
        exp: now + effectiveTimeInSeconds,
    };

    // Sign the token with the server secret
    const token = jwt.sign(payload, serverSecret, {
        algorithm: 'HS256',
        header: {
            alg: 'HS256',
            typ: 'JWT',
        },
    });

    return token;
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const roomId = searchParams.get('roomId');

  if (!userId || !roomId) {
    return NextResponse.json(
      { error: 'userId and roomId are required' },
      { status: 400 }
    );
  }

  const appId = parseInt(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID!, 10);
  const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET!;

  if (isNaN(appId) || !serverSecret) {
    return NextResponse.json(
      { error: 'ZegoCloud App ID or Server Secret is not configured' },
      { status: 500 }
    );
  }

   if (serverSecret.length !== 32) {
    return NextResponse.json(
      { error: 'ZegoCloud Server Secret must be 32 characters long.' },
      { status: 500 }
    );
  }

  try {
    // Using the manually implemented JWT token generation
    const token = generateZegoToken(appId, serverSecret, userId);
    return NextResponse.json({ token });

  } catch (error) {
    console.error('Error generating Zego token:', error);
    return NextResponse.json({ error: 'Failed to generate Zego token' }, { status: 500 });
  }
}