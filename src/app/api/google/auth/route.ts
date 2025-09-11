
import { getGoogleOAuth2Client } from '@/lib/google';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const oauth2Client = getGoogleOAuth2Client();

    // The pendingCallId is now passed in the 'state' parameter
    // We retrieve it from the session storage on the client before making this call
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state') || '';

    const scopes = ['https://www.googleapis.com/auth/calendar.events'];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state, // Pass the call ID in the state parameter
    });

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Failed to generate auth URL:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate auth URL.' }, { status: 500 });
  }
}
