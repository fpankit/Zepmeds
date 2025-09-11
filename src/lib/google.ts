
import { google } from 'googleapis';

let oauth2Client: any;

export function getGoogleOAuth2Client() {
  if (oauth2Client) {
    return oauth2Client;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Ensure this matches one of the authorized redirect URIs in your Google Cloud Console
  const redirectUri = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-url.com/api/google/callback'
    : 'http://localhost:3000/api/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Google client ID or secret is missing from environment variables.');
  }

  oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  return oauth2Client;
}
