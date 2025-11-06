import { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';

export const metadata: Metadata = {
  title: 'HP New - Moderne Webentwicklung',
  description: 'Professionelle Webentwicklung mit Next.js, TypeScript und modernen Technologien',
  keywords: ['Webentwicklung', 'Next.js', 'TypeScript', 'React', 'Tailwind CSS'],
  authors: [{ name: 'C0d3Cr4sh3r' }],
  openGraph: {
    title: 'HP New - Moderne Webentwicklung',
    description: 'Professionelle Webentwicklung mit Next.js, TypeScript und modernen Technologien',
    type: 'website',
    locale: 'de_DE',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-900 dark:to-zinc-900">
      <Hero />
      <Features />
      <About />
      <Contact />
    </div>
  );
}
