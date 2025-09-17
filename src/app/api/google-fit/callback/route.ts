
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { config } from 'dotenv';
config({ path: '.env' });

// This function now dynamically determines the base URL from the request headers
// to ensure it matches the one used in the auth route.
const getRedirectUri = (req: NextRequest) => {
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    return `${baseUrl}/api/google-fit/callback`;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const redirectUri = getRedirectUri(req);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
  
  const activityUrl = new URL('/activity', redirectUri);

  if (typeof code !== 'string') {
    activityUrl.searchParams.set('error', 'google_fit_failed');
    return NextResponse.redirect(activityUrl);
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
    activityUrl.searchParams.set('success', 'google_fit_synced');
    return NextResponse.redirect(activityUrl);
    
  } catch (error) {
    console.error('Error exchanging code for tokens', error);
    activityUrl.searchParams.set('error', 'google_fit_failed');
    return NextResponse.redirect(activityUrl);
  }
}
