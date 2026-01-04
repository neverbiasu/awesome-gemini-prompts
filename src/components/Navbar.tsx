"use client";

import Link from "next/link";
import { Button } from "@heroui/button";
import { usePathname, useSearchParams } from "next/navigation";
import { FaGithub, FaReddit } from "react-icons/fa";
import Logo from "./Logo";

import { Suspense } from "react";



function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Hub", href: "/hub" },
    { name: "Guide", href: "/about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="Awesome Gemini Prompts Home">
          <div className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full opacity-50 animate-pulse" />
            <Logo className="w-full h-full relative z-10" color="white" />
          </div>
          <span className="font-bold text-white tracking-tight hidden sm:block text-lg">
            Awesome Gemini Prompts
          </span>
        </Link>

        {/* Centered Navigation Links */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
              href="https://www.reddit.com/r/awesomegeminiprompts/" 
              target="_blank"
              className="p-2 text-zinc-400 hover:text-[#FF4500] transition-colors hover:bg-white/5 rounded-full"
              aria-label="Reddit Community"
            >
              <FaReddit size={20} />
            </Link>
          </div>


          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <Link 
            href="https://github.com/neverbiasu/awesome-gemini-prompts/issues/new?template=prompt_submission.yml" 
            target="_blank" 
            className="hidden sm:block"
          >
            <Button 
              size="sm" 
              className="bg-zinc-800 text-zinc-300 font-medium text-xs px-4 rounded-full hover:bg-zinc-700 hover:text-white border border-white/5"
            >
              Submit
            </Button>
          </Link>

          <Link href="https://aistudio.google.com/api-keys" target="_blank" className="hidden sm:block">
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
