import { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ArcanePixelsSection } from "@/components/ArcanePixelsSection";
import { EventHubSection } from "@/components/EventHubSection";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";

export const metadata: Metadata = {
  title: "HP New - Moderne Webentwicklung",
  description:
    "Professionelle Webentwicklung mit Next.js, TypeScript und modernen Technologien",
  keywords: ["Webentwicklung", "Next.js", "TypeScript", "React", "Tailwind CSS"],
  authors: [{ name: "C0d3Cr4sh3r" }],
  openGraph: {
    title: "HP New - Moderne Webentwicklung",
    description:
      "Professionelle Webentwicklung mit Next.js, TypeScript und modernen Technologien",
    type: "website",
    locale: "de_DE",
  },
};

export default function MarketingHome() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <ArcanePixelsSection />
      <EventHubSection />
      <About />
      <Contact />
    </div>
  );
}
