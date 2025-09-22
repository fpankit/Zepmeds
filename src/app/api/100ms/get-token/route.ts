
import { config } from 'dotenv';
config({ path: '.env' });

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create a new room on 100ms if it doesn't exist
async function getOrCreateRoom(roomId: string, secret: string) {
  const HMS_API_URL = "https://api.100ms.live/v2";
  const response = await fetch(`${HMS_API_URL}/rooms?name=${roomId}&enabled=true`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${secret}`,
          'Content-Type': 'application/json',
      },
  });

  const { data } = await response.json();
  
  // Check if a room with the same name (our appointmentId) already exists
  if (data && data.length > 0) {
    return data[0].id; // Return existing room ID
  }

  // If not, create a new room
  const createResponse = await fetch(`${HMS_API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: roomId, // Use appointmentId as room name for uniqueness
      description: `Consultation room for appointment ${roomId}`,
      template_id: process.env.NEXT_PUBLIC_HMS_TEMPLATE_ID, // Use the template ID from env
    }),
  });

  if (!createResponse.ok) {
    const errorBody = await createResponse.text();
    console.error("100ms room creation failed:", errorBody);
    throw new Error(`Failed to create 100ms room: ${errorBody}`);
  }

  const newRoom = await createResponse.json();
  return newRoom.id;
}


export async function POST(req: NextRequest) {
  const MANAGEMENT_TOKEN = process.env.HMS_MANAGEMENT_TOKEN;
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_HMS_TEMPLATE_ID;

  if (!MANAGEMENT_TOKEN || !TEMPLATE_ID) {
    return NextResponse.json(
      { error: '100ms management token or template ID is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { room_id: appointmentId, user_id, role } = await req.json();

    if (!appointmentId || !user_id || !role) {
        return NextResponse.json(
            { error: 'room_id, user_id, and role are required.' },
            { status: 400 }
        );
    }
    
    // Get the actual 100ms room ID, creating it if it doesn't exist
    const hmsRoomId = await getOrCreateRoom(appointmentId, MANAGEMENT_TOKEN);
    
    const payload = {
      access_key: process.env.HMS_ACCESS_KEY,
      room_id: hmsRoomId, // Use the actual HMS room ID here
      user_id,
      role,
      type: 'app',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, process.env.HMS_SECRET as string, {
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
