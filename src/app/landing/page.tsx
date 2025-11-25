"use client";

import Link from 'next/link';
import { Button } from '@heroui/react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#4E8CFF]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-[#F56C6C]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 z-10 text-center space-y-8">
        <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm text-zinc-400 mb-4 backdrop-blur-md">
          🚀 The Next-Gen Prompt Engineering Platform
        </div>
        
        <h1 className="text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
          Master the Art of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4E8CFF] via-[#9B6EF3] to-[#FF9E64] animate-gradient">
            Gemini Prompting
          </span>
        </h1>
        
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          A curated, automated, and structured collection of high-quality Gemini prompts. 
          Designed for developers, by developers.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link href="/hub">
            <Button 
              size="lg" 
              className="bg-white text-black font-semibold px-8 py-6 text-lg hover:scale-105 transition-transform"
            >
              Explore Hub
            </Button>
          </Link>
          <Link href="https://github.com/nev4rb14su/awesome-gemini-prompts" target="_blank">
            <Button 
              size="lg" 
              variant="bordered" 
              className="border-white/20 text-white font-medium px-8 py-6 text-lg hover:bg-white/10"
              startContent={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              }
            >
              Star on GitHub
            </Button>
          </Link>
        </div>

        {/* Stats / Trust */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20 border-t border-white/10 pt-12">
          <div>
            <div className="text-3xl font-bold text-white">Automated</div>
            <div className="text-zinc-500 text-sm mt-1">Daily Scrapes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Structured</div>
            <div className="text-zinc-500 text-sm mt-1">JSON Schema</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Open Source</div>
            <div className="text-zinc-500 text-sm mt-1">MIT License</div>
          </div>
        </div>
      </div>
    </div>
  );
}
