
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { config } from 'dotenv';
config({ path: '.env' });

// This function now dynamically determines the base URL from the request headers.
// This is more robust than relying on an environment variable.
const getRedirectUri = (req: NextRequest) => {
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    return `${baseUrl}/api/google-fit/callback`;
};


const scopes = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.blood_glucose.read',
  'https://www.googleapis.com/auth/fitness.blood_pressure.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.nutrition.read',
];

export async function GET(req: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: 'Google API credentials are not configured.' }, { status: 500 });
  }
  
  const redirectUri = getRedirectUri(req);
  
  const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
  );

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
  });

  return NextResponse.redirect(authorizationUrl);
}
