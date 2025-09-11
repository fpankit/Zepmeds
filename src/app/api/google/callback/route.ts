
import { getGoogleOAuth2Client } from '@/lib/google';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  const oauth2Client = getGoogleOAuth2Client();

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state'); // The call ID is passed in the state
  const baseUrl = process.env.BASE_URL || `https://${req.headers.get('host')}`;

  if (typeof code !== 'string') {
    return NextResponse.json({ error: 'Invalid authorization code.' }, { status: 400 });
  }

  // The 'state' parameter now holds the pendingCallId
  const pendingCallId = state;
  if (!pendingCallId) {
      return NextResponse.json({ error: 'No pending call ID found.' }, { status: 400 });
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
    
    // Update the Firestore document with the Meet link and status
    const callDocRef = doc(db, 'video_calls', pendingCallId);
    await updateDoc(callDocRef, {
        meetLink: meetLink,
        status: 'ringing'
    });

    // Instead of redirecting the server, return a script to the browser
    // that stores the link and redirects the user to the call page.
    const response = new NextResponse(`
      <script>
        sessionStorage.setItem('meetLink', '${meetLink}');
        // This is the tab that the user initiated the call from.
        // It will be redirected to the /call page.
        // We close this popup tab now.
        window.close();
      </script>
    `, {
        headers: {
            'Content-Type': 'text/html'
        }
    });

    return response;


  } catch (error: any) {
    console.error('Failed to process Google callback:', error);
    let errorMessage = 'Failed to create Google Meet link.';
    if (error.response?.data?.error_description) {
        errorMessage = error.response.data.error_description;
    }
    
    // Update the call document to 'failed' status
    if (pendingCallId) {
        const callDocRef = doc(db, 'video_calls', pendingCallId);
        await updateDoc(callDocRef, {
            status: 'failed',
            error: errorMessage,
        });
    }

    // Return a script that informs the user and closes the window.
    return new NextResponse(`
        <script>
            alert("Failed to create meeting: ${errorMessage}");
            window.close();
        </script>
    `, {
        headers: { 'Content-Type': 'text/html' },
        status: 500
    });
  }
}
