
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { config } from 'dotenv';
config({ path: '.env' });

const getRedirectUri = () => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    return `${baseUrl}/api/google-fit/callback`;
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  getRedirectUri()
);

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (typeof code !== 'string') {
    const redirectUrl = new URL('/activity', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('error', 'google_fit_failed');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // IMPORTANT: In a real application, you MUST save these tokens securely.
    // Associate them with the logged-in user in your database (e.g., Firestore).
    // The `access_token` is short-lived. The `refresh_token` (if present) is long-lived
    // and should be stored encrypted to get new access tokens without user interaction.
    
    console.log('Google Fit Tokens Received:', tokens);
    // For this demo, we are not storing the tokens.

    // Redirect user back to the activity page with a success message
    const redirectUrl = new URL('/activity', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('success', 'google_fit_synced');
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Error exchanging code for tokens', error);
    const redirectUrl = new URL('/activity', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('error', 'google_fit_failed');
    return NextResponse.redirect(redirectUrl);
  }
}
