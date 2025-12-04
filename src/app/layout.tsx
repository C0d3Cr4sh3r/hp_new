import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { mapRowToThemeSettings, THEME_SETTINGS_ID, THEME_SETTINGS_TABLE } from '@/lib/themeSettings'
import { DEFAULT_THEME_SETTINGS } from '@/lib/supabase'
import { GlobalAIAssistantWrapper } from '@/components/admin/assistant/GlobalAIAssistantWrapper'
import { SkipLinks } from '@/components/accessibility/SkipLinks'
import { CookieConsent } from '@/components/CookieConsent'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Theme-Settings aus der Datenbank laden
async function getThemeSettings() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(THEME_SETTINGS_TABLE)
      .select('*')
      .eq('id', THEME_SETTINGS_ID)
      .maybeSingle()

    if (error || !data) {
      return DEFAULT_THEME_SETTINGS
    }

    return mapRowToThemeSettings(data as Record<string, unknown>)
  } catch {
    return DEFAULT_THEME_SETTINGS
  }
}

export const metadata: Metadata = {
  title: "ArcanePixels - Web Development für Fotografen",
  description: "Professionelle Webentwicklung mit Next.js, TypeScript und modernen Technologien",
  keywords: ['Webentwicklung', 'Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Fotografen'],
  authors: [{ name: 'ArcanePixels' }],
  creator: 'ArcanePixels',
  publisher: 'ArcanePixels',
  openGraph: {
    title: 'ArcanePixels - Web Development für Fotografen',
    description: 'Professionelle Webentwicklung mit Next.js, TypeScript und modernen Technologien',
    type: 'website',
    locale: 'de_DE',
    siteName: 'ArcanePixels',
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
};

// viewport und themeColor sind in Next.js 15 deprecated in metadata
// Sie werden jetzt aus viewport.ts exportiert
export { viewport } from './viewport';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeSettings()

  // CSS-Variablen für das gesamte Theme
  const themeStyles = {
    '--theme-primary': theme.primaryColor,
    '--theme-accent': theme.accentColor,
    '--theme-primary-rgb': hexToRgb(theme.primaryColor),
    '--theme-accent-rgb': hexToRgb(theme.accentColor),
  } as React.CSSProperties

  return (
    <html lang="de" className="scroll-smooth" style={themeStyles}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLinks />
        {children}
        <CookieConsent />
        <GlobalAIAssistantWrapper />
      </body>
    </html>
  );
}

// Hilfsfunktion: Hex zu RGB konvertieren (für rgba() Verwendung)
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '99, 102, 241' // Fallback
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
}
