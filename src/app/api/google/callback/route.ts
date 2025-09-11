
import { getGoogleOAuth2Client } from '@/lib/google';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const oauth2Client = getGoogleOAuth2Client();

  const code = req.nextUrl.searchParams.get('code');

  if (typeof code !== 'string') {
    return NextResponse.json({ error: 'Invalid authorization code.' }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: 'Zepmeds Doctor Consultation',
      description: 'A video consultation with a doctor from Zepmeds.',
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(new Date().getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: uuidv4(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      attendees: [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 10 },
          { method: 'popup', minutes: 5 },
        ],
      },
    };

    const createdEvent = await calendar.events.insert({
      calendarId: 'primary',
      // @ts-ignore
      resource: event,
      conferenceDataVersion: 1,
    });
    
    const meetLink = createdEvent.data.hangoutLink;

    if (!meetLink) {
      throw new Error("Failed to create a Google Meet link.");
    }

    // Redirect the user to the Google Meet URL
    return NextResponse.redirect(meetLink);

  } catch (error: any) {
    console.error('Failed to process Google callback:', error);
    let errorMessage = 'Failed to create Google Meet link.';
    if (error.response?.data?.error_description) {
        errorMessage = error.response.data.error_description;
    }
    // Redirect to a failure page or show an error
    return NextResponse.redirect(new URL(`/call?error=${encodeURIComponent(errorMessage)}`, req.url));
  }
}
