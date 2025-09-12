
import { NextRequest, NextResponse } from 'next/server';

// This endpoint is no longer used as token generation is handled client-side.
// It is kept to prevent build errors from any lingering references, but it can be safely deleted.
export async function GET(req: NextRequest) {
  return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 410 });
}
