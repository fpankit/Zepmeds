
import { NextResponse, NextRequest } from 'next/server';
import { ZegoServerAssistant } from "zego-express-engine-webrtc";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roomId = searchParams.get('roomId');

    if (!userId || !roomId) {
        return NextResponse.json({ error: 'userId and roomId are required' }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID;
    const serverSecret = process.env.ZEGOCLOUD_SERVER_ SECRET;

    if (!appId || !serverSecret) {
        console.error('ZegoCloud App ID or Server Secret is not set in environment variables.');
        return NextResponse.json({ error: 'ZegoCloud credentials not configured on the server.' }, { status: 500 });
    }

    const effectiveTimeInSeconds = 3600; // Token validity period in seconds
    const payload = {
        room_id: roomId,
        privilege: {
            1: 1, // loginRoom
            2: 1, // publishStream
        },
        stream_id_list: null
    };

    try {
        const token = ZegoServerAssistant.generateToken04(Number(appId), userId, serverSecret, effectiveTimeInSeconds, payload);
        return NextResponse.json({ token, appId: Number(appId) });
    } catch (error) {
        console.error('Error generating ZegoCloud token:', error);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}
