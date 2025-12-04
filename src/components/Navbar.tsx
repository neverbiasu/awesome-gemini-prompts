"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { usePathname, useSearchParams } from "next/navigation";
import { FaGithub, FaReddit } from "react-icons/fa";

import { Suspense } from "react";

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  
  const navItems = [
    { name: "Text", href: "/hub?category=text" },
    { name: "Image", href: "/hub?category=image" },
    { name: "Video", href: "/hub?category=video" },
    { name: "Audio", href: "/hub?category=audio" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="Awesome Gemini Prompts Home">
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

        {/* Centered Navigation Links */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
          {navItems.map((item) => {
            const isActive = pathname === "/hub" && currentCategory === item.name.toLowerCase();
            return (
              <Link 
                key={item.name}
                href={item.href}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-white/10 text-white shadow-lg shadow-white/5" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link 
              href="https://github.com/neverbiasu/awesome-gemini-prompts" 
              target="_blank"
              className="p-2 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-full"
              aria-label="GitHub"
            >
              <FaGithub size={20} />
            </Link>
            <Link 
              href="https://www.reddit.com/r/GeminiAI/" 
              target="_blank"
              className="p-2 text-zinc-400 hover:text-[#FF4500] transition-colors hover:bg-white/5 rounded-full"
              aria-label="Reddit"
            >
              <FaReddit size={20} />
            </Link>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <Link href="https://ai.google.dev" target="_blank" className="hidden sm:block">
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

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}
