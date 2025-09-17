import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
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
  }
}