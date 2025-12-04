import type { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-900 dark:to-zinc-900">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}
