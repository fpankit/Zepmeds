
import { config } from 'dotenv';
config({ path: '.env' });

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

async function getOrCreateRoom(roomId: string, managementToken: string) {
    const response = await fetch(`https://api.100ms.live/v2/rooms/${roomId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${managementToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // You can add room configurations here if needed
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        // If the room already exists, the API might return an error that we can ignore
        if (response.status !== 409) { // 409 is conflict, means room exists
            throw new Error(error.message || 'Failed to get or create room.');
        }
    }
    // If successful or room exists, we can proceed. The function's purpose is to ensure the room exists.
    return roomId;
}


export async function POST(req: NextRequest) {
  const MANAGEMENT_TOKEN = process.env.HMS_MANAGEMENT_TOKEN;
  const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY;
  const HMS_SECRET = process.env.HMS_SECRET;

  if (!HMS_ACCESS_KEY || !HMS_SECRET || !MANAGEMENT_TOKEN) {
    return NextResponse.json(
      { error: '100ms credentials are not fully configured.' },
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
    
    // Ensure the room exists before generating a token for it
    await getOrCreateRoom(requestedRoomId, MANAGEMENT_TOKEN);
    
    const payload = {
      access_key: HMS_ACCESS_KEY,
      room_id: requestedRoomId, // Use the ID from the request
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
