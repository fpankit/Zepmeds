
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a ZegoCloud v2 JWT token.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const roomId = searchParams.get("roomId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }
  
  if (!roomId) {
    return NextResponse.json(
      { error: "roomId is required" },
      { status: 400 }
    );
  }

  const appId = Number(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID);
  const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET;

  if (!appId || isNaN(appId)) {
    console.error("ZegoCloud App ID is not configured or invalid.");
    return NextResponse.json(
      { error: "Missing Zego App ID on the server." },
      { status: 500 }
    );
  }

  if (!serverSecret || serverSecret.length !== 32) {
    console.error("ZegoCloud Server Secret is not configured or is not 32 characters long.");
     return NextResponse.json(
      { error: "Invalid Zego Server Secret on the server." },
      { status: 500 }
    );
  }

  const effectiveTimeInSeconds = 3600; // Token valid for 1 hour
  const creationTime = Math.floor(Date.now() / 1000);
  const expirationTime = creationTime + effectiveTimeInSeconds;
  
  const payload = {
      app_id: appId, // Ensure app_id is a number
      room_id: roomId,
      user_id: userId,
      privilege: {
          "1": 1, // loginRoom: 1 = allow
          "2": 1, // publishStream: 1 = allow
      },
      nonce: `nonce-${uuidv4()}`,
      ctime: creationTime,
      expire: expirationTime,
  };

  try {
    const token = jwt.sign(payload, serverSecret, {
        algorithm: 'HS256',
        header: {
            alg: 'HS256',
            typ: 'JWT',
        },
    });
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("Error generating Zego token:", error);
    return NextResponse.json(
      { error: "Failed to generate Zego token: " + error.message },
      { status: 500 }
    );
  }
}
