
import { config } from 'dotenv';
config({ path: '.env' });

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  // The MANAGEMENT_TOKEN is no longer needed for this simplified approach.
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_HMS_TEMPLATE_ID;
  const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY;
  const HMS_SECRET = process.env.HMS_SECRET;

  if (!TEMPLATE_ID || !HMS_ACCESS_KEY || !HMS_SECRET) {
    return NextResponse.json(
      { error: '100ms credentials (template, access key, or secret) are not configured.' },
      { status: 500 }
    );
  }

  try {
    const { room_id: requestedRoomId, user_id, role } = await req.json();

    if (!requestedRoomId || !user_id || !role) {
        return NextResponse.json(
            { error: 'room_id, user_id, and role are required.' },
            { status: 400 }
        );
    }
    
    // We will use the static TEMPLATE_ID as the room_id for all calls
    // to avoid dynamic room creation and the need for a management token.
    const hmsRoomId = TEMPLATE_ID;
    
    const payload = {
      access_key: HMS_ACCESS_KEY,
      room_id: hmsRoomId, // Use the static template ID as the room ID
      user_id,
      role,
      type: 'app',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, HMS_SECRET, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: uuidv4(),
    });

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: `Failed to generate token: ${error.message}` },
      { status: 500 }
    );
  }
}
