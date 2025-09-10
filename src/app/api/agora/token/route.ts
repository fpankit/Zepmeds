
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const channelName = searchParams.get('channelName');
    const uid = searchParams.get('uid') || Math.floor(Math.random() * 100000).toString();

    if (!channelName) {
        return NextResponse.json({ error: 'channelName is required' }, { status: 400 });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    // --- Start of Diagnostic Logging ---
    console.log("--- Agora Token Generation ---");
    console.log("Channel Name:", channelName);
    console.log("UID:", uid);
    if (appId) {
        console.log("App ID Loaded:", appId);
    } else {
        console.error("!!! Agora App ID is NOT loaded from .env.local");
    }
    if (appCertificate) {
        console.log("App Certificate Loaded (first 5 chars):", appCertificate.substring(0, 5));
    } else {
        console.error("!!! Agora App Certificate is NOT loaded from .env.local");
    }
    console.log("----------------------------");
    // --- End of Diagnostic Logging ---


    if (!appId || !appCertificate) {
        console.error('Agora App ID or App Certificate is not set in environment variables.');
        return NextResponse.json({ error: 'Agora credentials not configured on the server.' }, { status: 500 });
    }

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            Number(uid),
            role,
            privilegeExpiredTs
        );

        return NextResponse.json({ token, uid });
    } catch (error) {
        console.error('Error generating Agora token:', error);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}
