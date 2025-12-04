import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ArcanePixels - Web-Entwicklung für Fotografen',
    short_name: 'ArcanePixels',
    description: 'Professionelle Web-Entwicklung für Fotografen und kreative Professionals',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#7c3aed',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'photography', 'productivity'],
    lang: 'de',
    dir: 'ltr',
  }
}
