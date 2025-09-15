
import { config } from 'dotenv';
config({ path: '.env' });

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  // Read secrets directly from process.env, which is the standard for Vercel
  const ACCESS_KEY = process.env.HMS_ACCESS_KEY;
  const SECRET = process.env.HMS_SECRET;

  if (!ACCESS_KEY || !SECRET) {
    return NextResponse.json(
      { error: '100ms access key or secret is not configured in your Vercel environment variables.' },
      { status: 500 }
    );
  }

  try {
    const { room_id, user_id, role } = await req.json();

    if (!room_id || !user_id || !role) {
        return NextResponse.json(
            { error: 'room_id, user_id, and role are required.' },
            { status: 400 }
        );
    }
    
    const payload = {
      access_key: ACCESS_KEY,
      room_id,
      user_id,
      role,
      type: 'app',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, SECRET, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: uuidv4(),
    });

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token.' },
      { status: 500 }
    );
  }
}
