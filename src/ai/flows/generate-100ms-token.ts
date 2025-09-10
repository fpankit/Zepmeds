
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a 100ms authentication token.
 * This flow is designed to be called from the server-side to securely generate tokens
 * for users joining a video call room.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import * as jose from 'jose';

// Define input schema for the flow
const Generate100msTokenInputSchema = z.object({
  userId: z.string().describe('The unique identifier for the user.'),
  roomId: z.string().describe('The ID of the 100ms room to join.'),
  role: z.string().describe('The role of the user in the room (e.g., "host", "guest").'),
});

export type Generate100msTokenInput = z.infer<typeof Generate100msTokenInputSchema>;

// Define output schema for the flow
const Generate100msTokenOutputSchema = z.object({
  token: z.string().describe('The generated 100ms authentication token.'),
  error: z.string().optional().describe('An error message if token generation fails.'),
});

export type Generate100msTokenOutput = z.infer<typeof Generate100msTokenOutputSchema>;

// The main server-side function that can be called from components
export async function generate100msToken(input: Generate100msTokenInput): Promise<Generate100msTokenOutput> {
  return generate100msTokenFlow(input);
}


// Internal function to sign a JWT token
// This mimics what a server-side library like 'jsonwebtoken' would do
async function signJwt(payload: object, secret: string): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 24 * 60 * 60; // 24 hours

    return new jose.SignJWT({ ...payload, iat, exp, jti: uuidv4() })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt(iat)
        .setExpirationTime('24h')
        .sign(new TextEncoder().encode(secret));
}


const generate100msTokenFlow = ai.defineFlow(
  {
    name: 'generate100msTokenFlow',
    inputSchema: Generate100msTokenInputSchema,
    outputSchema: Generate100msTokenOutputSchema,
  },
  async ({ userId, roomId, role }) => {
    const accessKey = process.env.HMS_ACCESS_KEY;
    const appSecret = process.env.HMS_APP_SECRET;

    if (!accessKey || !appSecret) {
      console.error('100ms environment variables (HMS_ACCESS_KEY, HMS_APP_SECRET) are not set.');
      return { error: 'Server configuration error for video service.' };
    }

    try {
      const payload = {
        access_key: accessKey,
        room_id: roomId,
        user_id: userId,
        role: role,
        type: 'app',
        version: 2,
      };

      const token = await signJwt(payload, appSecret);
      
      return { token };

    } catch (error) {
      console.error('Error generating 100ms token:', error);
      return { error: 'Failed to generate video call token.' };
    }
  }
);
