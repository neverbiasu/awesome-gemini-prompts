"use client";

import Link from 'next/link';
import { Button } from '@heroui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden selection:bg-blue-500/30">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>

      <div className="container mx-auto px-6 z-10 pt-20 pb-20">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-zinc-400 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            v1.0 Public Beta
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Awesome <br/>
            Gemini Prompts
          </h1>
          
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-light">
            The open-source prompt engineering IDE for the Gemini era. <br className="hidden md:block"/>
            Automated discovery, strict schema validation, and developer-first design.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center">
            <Link href="/hub">
              <Button 
                size="lg" 
                className="bg-white text-black font-semibold px-8 h-12 rounded-full text-base hover:bg-zinc-200 transition-all w-full sm:w-auto"
              >
                Explore the Hub
              </Button>
            </Link>
            <Link href="https://github.com/neverbiasu/awesome-gemini-prompts" target="_blank">
              <Button 
                size="lg" 
                variant="bordered" 
                className="border-white/10 text-white font-medium px-8 h-12 rounded-full text-base hover:bg-white/5 w-full sm:w-auto backdrop-blur-sm"
                startContent={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                }
              >
                Star on GitHub
              </Button>
            </Link>
          </div>
        </div>

        {/* Bento Grid Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {/* Feature 1: Large */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-zinc-900/30 border border-white/10 hover:border-white/20 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <h2 className="text-2xl font-bold mb-2 text-white">Automated Discovery Engine</h2>
            <p className="text-zinc-300 mb-6 max-w-md">
              Our bots scour GitHub, Reddit, and official docs 24/7. We don't just copy-paste; we validate, clean, and structure the data.
            </p>
            <div className="flex gap-2 font-mono text-xs text-zinc-300 border-t border-white/5 pt-4">
              <span className="px-2 py-1 bg-zinc-800 rounded">Playwright</span>
              <span className="px-2 py-1 bg-zinc-800 rounded">GitHub GraphQL</span>
              <span className="px-2 py-1 bg-zinc-800 rounded">Zod Schema</span>
            </div>
          </div>

          {/* Feature 2: Tall */}
          <div className="md:row-span-2 p-8 rounded-3xl bg-zinc-900/30 border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl"/>
             <h2 className="text-2xl font-bold mb-2 text-white">Strict Schema</h2>
             <p className="text-zinc-300 mb-8">
               Every prompt is treated as code. We enforce a strict JSON schema to ensure interoperability.
             </p>
             <div className="space-y-3 font-mono text-xs text-zinc-300">
               <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                 <span>promptText</span>
                 <span className="text-emerald-400">string</span>
               </div>
               <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                 <span>inputSchema</span>
                 <span className="text-blue-400">object</span>
               </div>
               <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                 <span>modality</span>
                 <span className="text-purple-400">array</span>
               </div>
             </div>
           </div>

          {/* Feature 3: Standard */}
          <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/10 hover:border-white/20 transition-all">
            <h2 className="text-xl font-bold mb-2 text-white">Open Source</h2>
            <p className="text-zinc-300 text-sm">
              MIT Licensed. The data belongs to the community. Fork it, extend it, build on it.
            </p>
          </div>

          {/* Feature 4: Standard */}
          <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/10 hover:border-white/20 transition-all">
            <h2 className="text-xl font-bold mb-2 text-white">Daily Updates</h2>
            <p className="text-zinc-300 text-sm">
              Fresh prompts delivered daily via GitHub Actions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-white/5 text-center text-zinc-400 text-sm">
          <p>© 2025 Awesome Gemini Prompts. Built for the AI era.</p>
        </div>
      </div>
    </div>
  );
}
