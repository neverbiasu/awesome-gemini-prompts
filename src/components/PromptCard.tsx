"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button } from "@heroui/react";
import { GeminiPrompt } from "../schema/prompt";

const PLATFORM_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  github: { color: "text-white bg-zinc-800", label: "GitHub", icon: "github" },
  reddit: { color: "text-orange-400 bg-orange-400/10", label: "Reddit", icon: "reddit" },
  official_docs: { color: "text-blue-400 bg-blue-400/10", label: "Google", icon: "google" },
  web: { color: "text-emerald-400 bg-emerald-400/10", label: "Web", icon: "globe" },
  social: { color: "text-sky-400 bg-sky-400/10", label: "Social", icon: "twitter" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      isIconOnly
      onPress={handleCopy}
      size="sm"
      variant="light"
      className={`transition-all duration-300 ${
        copied 
          ? "text-emerald-400 bg-emerald-400/10" 
          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
      }`}
      aria-label="Copy prompt"
    >
      {copied ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </Button>
  );
}

export default function PromptCard({ prompt }: { prompt: GeminiPrompt }) {
  const platform = PLATFORM_CONFIG[prompt.sourcePlatform] || PLATFORM_CONFIG.web;

  return (
    <Card className="group w-full h-full border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-white/10 transition-all duration-300 rounded-xl backdrop-blur-sm">
      {/* Header: Title & Meta */}
      <CardHeader className="flex flex-col items-start gap-3 p-5 pb-0">
        <div className="flex w-full justify-between items-start">
          <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${platform.color} border border-white/5`}>
            {platform.label}
          </div>
          {prompt.metaMetrics && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <span>{prompt.metaMetrics.stars || prompt.metaMetrics.upvotes || 0}</span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-zinc-100 leading-tight group-hover:text-white transition-colors">
          {prompt.title}
        </h3>
      </CardHeader>
      
      {/* Body: Content & Specs */}
      <CardBody className="p-5 flex flex-col gap-4">
        {/* System Instruction (if present) */}
        {prompt.systemInstruction && (
          <div className="relative overflow-hidden rounded-lg bg-blue-500/5 border border-blue-500/10 p-3">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
            <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">System Instruction</p>
            <p className="text-xs text-blue-200/80 line-clamp-2 font-mono">{prompt.systemInstruction}</p>
          </div>
        )}

        {/* Main Prompt Content - IDE Style */}
        <div className="relative flex-1 min-h-[120px] rounded-lg bg-black/40 border border-white/5 p-4 font-mono text-sm text-zinc-300 leading-relaxed overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {prompt.promptText}
        </div>

        {/* Tags & Modality */}
        <div className="flex flex-wrap gap-2 items-center justify-between mt-auto pt-2">
          <div className="flex flex-wrap gap-1.5">
            {prompt.modelTarget && (
               <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                 {prompt.modelTarget}
               </span>
            )}
            {prompt.modality?.map(m => (
               <span key={m} className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                 {m}
               </span>
            ))}
          </div>
        </div>
      </CardBody>
      
      {/* Footer: Action */}
      <CardFooter className="p-5 pt-0 flex justify-between items-center border-t border-white/5 mt-auto">
        <div className="flex gap-2 overflow-hidden">
           {prompt.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-default">
              #{tag}
            </span>
          ))}
        </div>
        <CopyButton text={prompt.promptText} />
      </CardFooter>
    </Card>
  );
}
