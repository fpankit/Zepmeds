
import { config } from 'dotenv';
config({ path: '.env' });

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY;
  const HMS_SECRET = process.env.HMS_SECRET;
  const HMS_TEMPLATE_ID = process.env.NEXT_PUBLIC_HMS_TEMPLATE_ID;

  if (!HMS_ACCESS_KEY || !HMS_SECRET || !HMS_TEMPLATE_ID) {
    return NextResponse.json(
      { error: '100ms credentials are not fully configured.' },
      { status: 500 }
    );
  }

  try {
    const { user_id, role } = await req.json();

    if (!user_id || !role) {
        return NextResponse.json(
            { error: 'user_id, and role are required.' },
            { status: 400 }
        );
    }
    
    // The payload now consistently uses the static template ID from environment variables.
    // The dynamic appointment ID will be passed as `name` in the join call on the client.
    const payload = {
      access_key: HMS_ACCESS_KEY,
      room_id: HMS_TEMPLATE_ID, 
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
