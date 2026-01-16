import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { UserProvider } from "@/components/UserSwitcher";
import { Toaster } from "sonner";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sanctuary.OS",
  description: "Workspace Monitoring and Allocation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ConvexClientProvider>
          <UserProvider>
            {children}
            <Toaster position="top-center" theme="dark" className="font-mono" />
          </UserProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
