"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isHub = pathname === "/hub";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Awesome Gemini Prompts Home">
          <div className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full opacity-50 animate-pulse" />
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_10px_rgba(155,110,243,0.5)]">
              <path d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z" fill="url(#gemini-gradient)" />
              <defs>
                <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4E8CFF">
                    <animate attributeName="stop-color" values="#4E8CFF; #9B6EF3; #FF9E64; #4E8CFF" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#9B6EF3">
                    <animate attributeName="stop-color" values="#9B6EF3; #FF9E64; #4E8CFF; #9B6EF3" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#FF9E64">
                    <animate attributeName="stop-color" values="#FF9E64; #4E8CFF; #9B6EF3; #FF9E64" dur="4s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="font-bold text-white tracking-tight hidden sm:block text-lg">
            Awesome Gemini
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link 
            href="/hub" 
            className={`text-sm font-medium transition-colors ${
              isHub ? "text-white" : "text-zinc-300 hover:text-white"
            }`}
          >
            Prompt Hub
          </Link>
          <Link 
            href="https://github.com/neverbiasu/awesome-gemini-prompts" 
            target="_blank"
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            GitHub
          </Link>
          
          <div className="h-4 w-px bg-white/10 mx-2" />

          <Link href="https://ai.google.dev" target="_blank">
            <Button 
              size="sm" 
              className="bg-white text-black font-semibold text-xs px-4 rounded-full hover:bg-zinc-200"
            >
              Get API Key
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
