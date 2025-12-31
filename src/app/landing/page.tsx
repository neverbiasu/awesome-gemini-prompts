"use client";

import Link from 'next/link';
import { Button } from '@heroui/button';
import PromptCard from '@/components/PromptCard';
import { GeminiPrompt } from '@/schema/prompt';

const FEATURED_PROMPTS: GeminiPrompt[] = [
  {
    id: "demo-1",
    title: "Chain of Thought Reasoning",
    description: "Force the model to think step-by-step before answering complex logic questions. Essential for math and coding tasks.",
    modality: ["text"],
    tags: ["logic", "reasoning", "CoT"],
    compatibleModels: ["gemini-2.5-pro"],
    stats: { views: 0, copies: 0, likes: 128 },
    author: { name: "Google DeepMind", platform: "Google" },
    systemInstruction: { parts: [{ text: "You are an expert logic engine. Before answering, output <thinking> tags and breakdown your reasoning step by step." }] },
    contents: [{ role: "user", parts: [{ text: "Solve this logic puzzle: Three gods A, B, and C are called, in no particular order, True, False, and Random..." }] }]
  },
  {
    id: "demo-2",
    title: "React Component Generator",
    description: "Generates clean, accessible, and Tailwind-styled React components with strict TypeScript types.",
    modality: ["text"],
    tags: ["coding", "react", "tailwindcss"],
    compatibleModels: ["gemini-2.5-flash"],
    stats: { views: 0, copies: 0, likes: 256 },
    author: { name: "Vercel", platform: "GitHub" },
    systemInstruction: { parts: [{ text: "You are a senior frontend engineer. Generate React components using 'use client', Lucide icons, and shadcn/ui patterns." }] },
    contents: [{ role: "user", parts: [{ text: "Create a responsive dashboard sidebar with a collapsing animation." }] }]
  },
  {
    id: "demo-3",
    title: "Cyberpunk Cityscape Generator",
    description: "Optimized prompt for Imagen 3 to generate high-fidelity, neofuturistic city environments.",
    modality: ["image"],
    tags: ["art", "midjourney-style", "sci-fi"],
    compatibleModels: ["imagen-4.0-ultra-generate-preview-06-06"],
    stats: { views: 0, copies: 0, likes: 312 },
    author: { name: "MidLibrary", platform: "UserSubmission" },
    originalSourceUrl: "https://midlibrary.io",
    contents: [{ role: "user", parts: [{ text: "A futuristic city with neon lights, rain-slicked streets, towering holograms, cinematic lighting, 8k resolution..." }] }]
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden selection:bg-blue-500/30">
      {/* Minimalist Background */}
      <div className="absolute inset-0 bg-black">
        {/* Subtle Grid - barely visible */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container mx-auto px-6 z-10 pt-24 pb-24 relative">
        
        {/* 1. Hero Content */}
        <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-zinc-400">
             <span className="w-2 h-2 rounded-full bg-white"></span>
             v0.2.0 is now live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none text-white">
            The Ultimate Collection of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-zinc-500">Gemini & Nano Prompts</span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Not just a list. An LLM-verified library optimized for <br className="hidden md:block" />
            <span className="text-white font-medium">Gemini 3</span>, <span className="text-white font-medium">Gemini 2.5 (Flash/Pro)</span>, and <span className="text-white font-medium">Nano Banana Pro</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/hub">
              <Button size="lg" className="bg-white text-black font-semibold px-8 rounded-full">
                Explore Hub
              </Button>
            </Link>
            <Link href="https://github.com/neverbiasu/awesome-gemini-prompts" target="_blank">
               <Button size="lg" variant="bordered" className="border-white/10 text-white px-8 rounded-full">
                GitHub
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Featured Prompts Showcase */}
        <div className="w-full max-w-6xl mx-auto mb-32">
           <div className="flex items-center justify-between mb-8 px-2">
             <h2 className="text-2xl font-bold text-white">Community Favorites</h2>
             <Link href="/hub" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
               View all 1,100+ prompts <span aria-hidden="true">&rarr;</span>
             </Link>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURED_PROMPTS.map((prompt) => (
                <div key={prompt.id} className="scale-100 hover:scale-[1.02] transition-transform duration-300">
                  <PromptCard prompt={prompt} />
                </div>
              ))}
           </div>
        </div>

        {/* 3. Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-32">
           <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Automated Discovery</h3>
              <p className="text-sm text-zinc-400">Scrapers run daily on Reddit & GitHub to find the latest trending prompts.</p>
           </div>
           
           <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">LLM Validated</h3>
              <p className="text-sm text-zinc-400">Every prompt is tested and cleaned by Gemini 2.5 to ensure stability.</p>
           </div>

           <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Run</h3>
              <p className="text-sm text-zinc-400">One-click export to Google AI Studio with all parameters pre-configured.</p>
           </div>
        </div>

        {/* 4. Professional Footer */}
        <footer className="border-t border-white/5 pt-16 pb-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                 <div className="flex items-center gap-2 mb-4">
                   <div className="w-8 h-8 relative">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_10px_rgba(155,110,243,0.5)]">
                      <path d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z" fill="url(#gemini-gradient-footer)" />
                      <defs>
                        <linearGradient id="gemini-gradient-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4E8CFF" />
                          <stop offset="100%" stopColor="#FF9E64" />
                        </linearGradient>
                      </defs>
                    </svg>
                   </div>
                   <span className="text-sm font-bold text-white tracking-tight">Awesome Gemini Prompts</span>
                 </div>
                 <p className="text-xs text-zinc-500 leading-relaxed pr-4">
                   Building the definitive collection of high-quality prompts for the next generation of AI models.
                 </p>
              </div>
              
              <div>
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
                 <ul className="space-y-2 text-xs text-zinc-400">
                    <li><Link href="/hub" className="hover:text-white transition-colors">Prompt Hub</Link></li>
                    <li><Link href="/hub?category=image" className="hover:text-white transition-colors">Image Prompts</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Submit Prompt</Link></li>
                 </ul>
              </div>

              <div>
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
                 <ul className="space-y-2 text-xs text-zinc-400">
                    <li><Link href="https://ai.google.dev" className="hover:text-white transition-colors">Gemini API</Link></li>
                    <li><Link href="/about" className="hover:text-white transition-colors">Documentation</Link></li>
                    <li><Link href="https://github.com/neverbiasu/awesome-gemini-prompts" className="hover:text-white transition-colors">GitHub</Link></li>
                    <li><Link href="https://www.reddit.com/r/awesomegeminiprompts/" className="hover:text-white transition-colors text-[#FF4500]">Reddit Community</Link></li>
                 </ul>
              </div>

               <div>
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal</h4>
                 <ul className="space-y-2 text-xs text-zinc-400">
                    <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                 </ul>
              </div>
           </div>
           
           <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-600">
              <p>© 2025 Awesome Gemini Prompts. Released under CC BY-NC-SA 4.0.</p>
              <div className="flex gap-4">
                 <span>Built using Next.js 14</span>
                 <span>Hosted on Vercel</span>
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}
