
import { NextResponse } from 'next/server';
import type { MetadataRoute } from 'next';
 
const manifest = (): MetadataRoute.Manifest => ({
  name: 'Zepmeds: Your Health Partner',
  short_name: 'Zepmeds',
  description: 'Order medicines, consult doctors, and manage your health with Zepmeds.',
  start_url: '/',
  display: 'standalone',
  background_color: '#0e1015',
  theme_color: '#0e1015',
  icons: [
    {
      src: '/favicon.ico',
      sizes: 'any',
      type: 'image/x-icon',
    },
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png"
    }
  ],
});

export async function GET() {
  return NextResponse.json(manifest());
}

// This tells Next.js to treat this route as static.
export const dynamic = 'force-static';
