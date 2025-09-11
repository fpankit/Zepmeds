import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/layout/providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Zepmeds: Online Medicine Delivery',
  description: 'Your trusted partner for online medicine delivery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin=""/>
      </head>
      <body className="font-body antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Script src='https://meet.jit.si/external_api.js' strategy="beforeInteractive" />
      </body>
    </html>
  );
}
