
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { config } from 'dotenv';
config({ path: '.env' });

const getRedirectUri = () => {
    // This will be set by the environment (e.g., Vercel, Cloud Workstations)
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    return `${baseUrl}/api/google-fit/callback`;
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  getRedirectUri()
);

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

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
  });

  return NextResponse.redirect(authorizationUrl);
}
