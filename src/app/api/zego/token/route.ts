import { NextRequest, NextResponse } from "next/server";
import { sign } from 'jsonwebtoken';

/**
 * Generates a ZegoCloud token using JWT.
 * This is based on the v2 token specification.
 */
function generateZegoToken(appId: number, serverSecret: string, userId: string): string {
    if (serverSecret.length !== 32) {
        throw new Error("ZegoCloud serverSecret must be 32 characters long.");
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = now + 3600; // Token valid for 1 hour

    const payload = {
        app_id: appId,
        user_id: userId,
        ctime: now,
        expire: expirationTime,
        nonce: Math.floor(Math.random() * 900000) + 100000,
    };

    const token = sign(payload, serverSecret, {
        algorithm: 'HS256',
        header: {
            alg: 'HS256',
            typ: 'JWT'
        }
    });

    return "04" + Buffer.from(JSON.stringify({
        ver: 2,
        expired: expirationTime,
        token: token
    })).toString('base64');
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const roomId = searchParams.get("roomId"); // RoomID is not used in v2 token, but kept for API consistency

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const appId = Number(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID);
  const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET;

  if (!appId || !serverSecret) {
    console.error("ZegoCloud App ID or Server Secret is not configured.");
    return NextResponse.json({ error: "Missing Zego credentials on the server." }, { status: 500 });
  }

  try {
    const token = generateZegoToken(appId, serverSecret, userId);
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("Error generating Zego token:", error.message);
    return NextResponse.json({ error: "Failed to generate Zego token: " + error.message }, { status: 500 });
  }
}
