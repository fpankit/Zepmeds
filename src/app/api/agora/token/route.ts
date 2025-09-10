
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const channelName = searchParams.get('channelName');
    
    // The UID must be a 32-bit integer. We'll generate a random one if not provided.
    // The previous implementation using a sanitized phone number was too large.
    const uid = Math.floor(Math.random() * 100000);

    if (!channelName) {
        return NextResponse.json({ error: 'channelName is required' }, { status: 400 });
    }

    const appId = "5bbb95c735a84da6af004432f4ced817";
    const appCertificate = "1bf69568d5be48ed8a27149b3366b79b";

    if (!appId || !appCertificate) {
        console.error('Agora App ID or App Certificate is not set.');
        return NextResponse.json({ error: 'Agora credentials not configured on the server.' }, { status: 500 });
    }

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    try {
        console.log(`--- Agora Token Generation ---`);
        console.log(`Channel Name: ${channelName}`);
        console.log(`UID: ${uid}`);
        console.log(`App ID: ${appId ? 'Loaded' : 'NOT LOADED'}`);
        console.log(`App Cert (first 5): ${appCertificate ? appCertificate.substring(0, 5) : 'NOT LOADED'}`);
        console.log(`----------------------------`);

        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid, // UID is now a valid integer
            role,
            privilegeExpiredTs
        );

        return NextResponse.json({ token, uid });
    } catch (error) {
        console.error('Error generating Agora token:', error);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}
