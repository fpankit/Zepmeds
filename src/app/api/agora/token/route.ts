
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const channelName = searchParams.get('channelName');
    // UID can be a user ID from your database. For this example, we'll use a random number.
    const uid = searchParams.get('uid') || Math.floor(Math.random() * 100000).toString();

    // Validate that the channelName is provided
    if (!channelName) {
        return NextResponse.json({ error: 'channelName is required' }, { status: 400 });
    }

    // Get your App ID and App Certificate from environment variables
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
        console.error('Agora App ID or App Certificate is not set in environment variables.');
        return NextResponse.json({ error: 'Agora credentials not configured on the server.' }, { status: 500 });
    }

    // Set the role for the user
    const role = RtcRole.PUBLISHER;
    // Token expiration time in seconds (e.g., 1 hour)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    try {
        // Build the token
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            Number(uid),
            role,
            privilegeExpiredTs
        );

        // Return the token and UID to the client
        return NextResponse.json({ token, uid });
    } catch (error) {
        console.error('Error generating Agora token:', error);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}
