
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// This is the new endpoint to generate a Jitsi JWT
export async function POST(req: NextRequest) {
  try {
    const { room, user } = await req.json();

    if (!room || !user || !user.id || !user.name) {
      return NextResponse.json({ error: 'Room and user details are required' }, { status: 400 });
    }

    const privateKey = process.env.JITSI_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const appId = process.env.JITSI_APP_ID;
    const kid = process.env.JITSI_KID;

    if (!privateKey || !appId || !kid) {
      console.error('Jitsi environment variables are not set');
      return NextResponse.json({ error: 'Server configuration error for Jitsi.' }, { status: 500 });
    }
    
    if (privateKey.includes("PASTE_YOUR_PRIVATE_KEY_HERE")) {
        return NextResponse.json({ error: 'Jitsi Private Key is not configured on the server. Please add it to the .env file.' }, { status: 500 });
    }

    const now = Math.floor(Date.now() / 1000);
    const twoHours = 2 * 60 * 60;

    const payload = {
      aud: 'jitsi',
      iss: 'chat',
      iat: now,
      nbf: now - 10, // Not before, allowing for a 10-second clock skew
      exp: now + twoHours, // Expires in 2 hours
      sub: appId,
      room: room,
      context: {
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar || '',
          email: user.email || '',
          moderator: user.isModerator ? 'true' : 'false',
        },
        features: {
          livestreaming: true,
          recording: true,
          transcription: true,
          "outbound-call": true,
          "sip-outbound-call": true,
          "file-upload": true,
        },
      },
    };

    const header = {
      alg: 'RS256',
      kid: kid,
      typ: 'JWT',
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      header,
    });

    return NextResponse.json({ token });

  } catch (error) {
    console.error('Error generating Jitsi token:', error);
    return NextResponse.json({ error: 'Failed to generate Jitsi token' }, { status: 500 });
  }
}
