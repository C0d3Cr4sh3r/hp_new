import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ArcanePixelsSection } from "@/components/ArcanePixelsSection";
import { EventHubSection } from "@/components/EventHubSection";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";

// Metadata wird von layout.tsx geerbt - keine Duplikation nötig

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
