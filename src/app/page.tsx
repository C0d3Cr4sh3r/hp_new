import type { Metadata } from 'next';
import { ArcaneLanding } from '@/components/arcane/ArcaneLanding';

export const metadata: Metadata = {
  title: 'ArcanePixels - Web-Entwicklung für Fotografen',
  description:
    'ArcanePixels bietet maßgeschneiderte Web-Entwicklung für Fotografen und kreative Professionals. Entdecken Sie ShootingHub - die moderne App für Shooting-Management.',
  keywords: ['ArcanePixels', 'Web-Entwicklung', 'Fotografen', 'ShootingHub', 'Portfolio', 'CMS'],
  authors: [{ name: 'ArcanePixels' }],
  openGraph: {
    title: 'ArcanePixels - Web-Entwicklung für Fotografen',
    description:
      'Professionelle Web-Entwicklung für Fotografen und ShootingHub - die moderne App für Shooting-Management.',
    type: 'website',
    locale: 'de_DE',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4">
        <ArcaneLanding />
      </div>
    </div>
  );
}
