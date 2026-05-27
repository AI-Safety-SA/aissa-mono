import React from "react";
import "@repo/ui/styles.css";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { ThemeScript } from "@/components/theme-script";

export const metadata = {
  title: "AI Safety South Africa",
  description:
    "Public track record for AI Safety South Africa programs, events, and research.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://aisafetysa.com",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background">
        <ThemeScript />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
