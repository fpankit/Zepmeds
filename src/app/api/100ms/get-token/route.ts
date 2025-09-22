
import { config } from 'dotenv';
config({ path: '.env' });

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// This function is no longer needed as we'll use a static template ID.
// It is kept here commented out for reference but is not used.
/*
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
    return roomId;
}
*/

export async function POST(req: NextRequest) {
  // We no longer need the management token for this simplified approach.
  const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY;
  const HMS_SECRET = process.env.HMS_SECRET;

  if (!HMS_ACCESS_KEY || !HMS_SECRET) {
    return NextResponse.json(
      { error: '100ms credentials are not fully configured.' },
      { status: 500 }
    );
  }

  try {
    // We get room_id from the request, which will be the template_id passed from the client.
    const { room_id: requestedRoomId, user_id, role } = await req.json();

    if (!requestedRoomId || !user_id || !role) {
        return NextResponse.json(
            { error: 'room_id, user_id, and role are required.' },
            { status: 400 }
        );
    }
    
    // The room creation/validation logic is removed to avoid using the management token.
    
    const payload = {
      access_key: HMS_ACCESS_KEY,
      room_id: requestedRoomId, // Use the ID from the request (which should be the template ID)
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
