
import { getGoogleOAuth2Client } from '@/lib/google';
import { NextResponse } from 'next/server';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export async function GET() {
  try {
    const oauth2Client = getGoogleOAuth2Client();

    const scopes = ['https://www.googleapis.com/auth/calendar.events'];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Failed to generate auth URL:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate auth URL.' }, { status: 500 });
  }
}
