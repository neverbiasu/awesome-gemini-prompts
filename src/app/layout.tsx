import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from '@vercel/analytics/next';
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Awesome Gemini Prompts | The Open Source Prompt IDE",
  description: "Discover, test, and share high-quality Gemini prompts. The open-source prompt engineering IDE for the Gemini era.",
};

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='dark'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black min-h-screen`}
      >
        <Providers>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
          <SpeedInsights />
          <Analytics mode="production" />
        </Providers>
      </body>
    </html>
  );
}
