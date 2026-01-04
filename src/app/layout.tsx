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
  metadataBase: new URL('https://awesome-gemini-prompts.vercel.app'),
  title: {
    default: "Awesome Gemini Prompts | The Ultimate Collection",
    template: "%s | Awesome Gemini Prompts"
  },
  description: "The largest open-source collection of LLM-verified prompts optimized for Gemini 2.5, Gemini 3, and Nano Banana.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://awesome-gemini-prompts.vercel.app',
    siteName: 'Awesome Gemini Prompts',
    images: [
      {
        url: '/api/og?title=Awesome Gemini Prompts&tags=Gemini,AI,Prompts',
        width: 1200,
        height: 630,
        alt: 'Awesome Gemini Prompts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Awesome Gemini Prompts',
    description: 'The largest open-source collection of verified Gemini prompts.',
    creator: '@localhost_8188',
    images: ['/api/og?title=Awesome Gemini Prompts&tags=Gemini,AI,Prompts'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='dark' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black min-h-screen`}
        suppressHydrationWarning
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
