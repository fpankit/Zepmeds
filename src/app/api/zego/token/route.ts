
import { NextRequest, NextResponse } from "next/server";
import { sign } from 'jsonwebtoken';

/**
 * Generates a ZegoCloud token using JWT for the v2 specification.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const roomId = searchParams.get("roomId"); 

  if (!userId || !roomId) {
    return NextResponse.json({ error: "userId and roomId are required" }, { status: 400 });
  }

  const appId = Number(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID);
  const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET;

  if (!appId || !serverSecret) {
    console.error("ZegoCloud App ID or Server Secret is not configured.");
    return NextResponse.json({ error: "Missing Zego credentials on the server." }, { status: 500 });
  }

  if (serverSecret.length !== 32) {
    console.error("ZegoCloud serverSecret must be 32 characters long.");
    return NextResponse.json({ error: "Invalid Zego server secret configuration." }, { status: 500 });
  }

  const now = Math.floor(Date.now() / 1000);
  const expirationTime = now + 3600; // Token valid for 1 hour

  const payload = {
      app_id: appId,
      room_id: roomId,
      user_id: userId,
      privilege: {
          1: 1, // login room
          2: 1, // publish stream
      },
      ctime: now,
      expire: expirationTime,
      nonce: Math.floor(Math.random() * 900000) + 100000,
  };

  try {
    const token = sign(JSON.stringify(payload), serverSecret, {
        algorithm: 'HS256',
        header: {
            alg: 'HS256',
            typ: 'JWT'
        }
    });

    return NextResponse.json({ token });

  } catch (error: any) {
    console.error("Error generating Zego token:", error.message);
    return NextResponse.json({ error: "Failed to generate Zego token: " + error.message }, { status: 500 });
  }
}
