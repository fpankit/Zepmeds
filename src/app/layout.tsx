import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/layout/providers';
import Script from 'next/script';
import { Inter, Space_Grotesk } from 'next/font/google';
import { IncomingCallManager } from '@/components/features/incoming-call-manager';
import { manifest } from 'next/dist/lib/metadata/manifest';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
  title: 'Zepmeds: Online Medicine Delivery',
  description: 'Your trusted partner for online medicine delivery.',
  manifest: '/manifest.ts'
};

export const viewport: Viewport = {
  themeColor: '#0e1015',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin=""/>
      </head>
      <body className="font-body antialiased">
        <Providers>
          <IncomingCallManager />
          {children}
          <Toaster />
        </Providers>
        <Script src='https://meet.jit.si/external_api.js' strategy="beforeInteractive" />
      </body>
    </html>
  );
}
