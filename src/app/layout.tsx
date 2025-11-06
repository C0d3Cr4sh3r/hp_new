import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HP New - Moderne Webentwicklung",
  description: "Professionelle Webentwicklung mit Next.js, TypeScript und modernen Technologien",
  keywords: ['Webentwicklung', 'Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'MCP'],
  authors: [{ name: 'C0d3Cr4sh3r' }],
  creator: 'C0d3Cr4sh3r',
  publisher: 'HP New',
  openGraph: {
    title: 'HP New - Moderne Webentwicklung',
    description: 'Professionelle Webentwicklung mit Next.js, TypeScript und modernen Technologien',
    type: 'website',
    locale: 'de_DE',
    siteName: 'HP New',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
      >
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
