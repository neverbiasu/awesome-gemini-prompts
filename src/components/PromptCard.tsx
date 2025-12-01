"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Tooltip } from "@heroui/react";
import { GeminiPrompt } from "../schema/prompt";

const PLATFORM_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  GitHub: { color: "text-white bg-zinc-800", label: "GitHub", icon: "github" },
  Reddit: { color: "text-orange-400 bg-orange-400/10", label: "Reddit", icon: "reddit" },
  Google: { color: "text-blue-400 bg-blue-400/10", label: "Google", icon: "google" },
  UserSubmission: { color: "text-emerald-400 bg-emerald-400/10", label: "Community", icon: "globe" },
  Discord: { color: "text-indigo-400 bg-indigo-400/10", label: "Discord", icon: "discord" },
};

function CopyButton({ text, tooltip = "Copy Prompt" }: { text: string; tooltip?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    e.preventDefault();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip content={copied ? "Copied!" : tooltip}>
      <Button
        isIconOnly
        onClick={handleCopy}
        size="sm"
        variant="light"
        className={`transition-all duration-300 min-w-8 w-8 h-8 ${
          copied 
            ? "text-emerald-400 bg-emerald-400/10" 
            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
        }`}
        aria-label={tooltip}
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
    </Tooltip>
  );
}

export default function PromptCard({ prompt }: { prompt: GeminiPrompt }) {
  // Determine platform with legacy fallback
  let platformKey = prompt.author?.platform;
  if (!platformKey) {
    const source = (prompt as any).sourcePlatform;
    if (source === 'reddit') platformKey = 'Reddit';
    else if (source === 'github') platformKey = 'GitHub';
    else if (source === 'official_docs') platformKey = 'Google';
    else platformKey = 'Google'; // Default fallback
  }
  
  const platform = PLATFORM_CONFIG[platformKey] || PLATFORM_CONFIG.Google;

  // Helper to format model list
  const models = prompt.compatibleModels || ["gemini-1.5-pro"];
  const displayModel = models[0].replace('gemini-', '');
  const extraModelsCount = models.length - 1;

  // Extract text content
  const systemText = prompt.systemInstruction?.parts?.[0]?.text;
  const userText = prompt.contents?.[0]?.parts?.[0]?.text || prompt.promptText || "";

  // Handle legacy fields
  const sourceUrl = prompt.originalSourceUrl || (prompt as any).originUrl;
  const likes = prompt.stats?.likes || (prompt as any).metaMetrics?.stars || (prompt as any).metaMetrics?.upvotes || 0;

  return (
    <Card 
      isPressable={false}
      className="group w-full h-[380px] border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-white/10 transition-all duration-300 rounded-xl backdrop-blur-sm flex flex-col text-left"
    >
      {/* Header: Title & Meta */}
      <CardHeader 
        className="flex flex-col items-start gap-3 p-5 pb-0 shrink-0 w-full"
      >
        <div className="flex w-full justify-between items-start">
          <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${platform.color} border border-white/5`}>
            {platform.label}
          </div>
          
          {/* Metrics */}
          {likes > 0 && platformKey !== 'Google' && (
            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-1" title="Upvotes/Likes">
                <svg className="w-3.5 h-3.5 text-rose-500/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{likes}</span>
              </div>
            </div>
          )}
        </div>
        <Tooltip content={prompt.title} delay={1000}>
          <h3 className="text-lg font-semibold text-zinc-100 leading-tight group-hover:text-white transition-colors line-clamp-1 w-full">
            {prompt.title}
          </h3>
        </Tooltip>
      </CardHeader>
      
      {/* Body: Content & Specs */}
      <CardBody 
        className="p-5 flex flex-col gap-3 overflow-hidden w-full h-full"
      >
        {/* System Instruction (Persona) */}
        {systemText && (
          <div className={`
            relative rounded-lg border-l-4 border-secondary bg-default-100/50 p-3 text-xs font-mono text-default-600
            ${!userText ? 'flex-1 overflow-hidden' : 'shrink-0 max-h-[40%] overflow-hidden'}
          `}>
            <div className="flex justify-between items-center mb-1">
              <span className="uppercase text-[10px] font-bold text-secondary tracking-wider">System</span>
              <span className="text-[9px] text-warning uppercase font-bold tracking-wider border border-warning/20 px-1 rounded">API Only</span>
            </div>
            <div className="relative h-full">
                 <p className="whitespace-pre-wrap line-clamp-none">{systemText}</p>
            </div>
          </div>
        )}

        {/* User Prompt */}
        {userText && (
          <div className="relative group flex-1 overflow-hidden flex flex-col">
            <Chip size="sm" variant="flat" color="secondary" className="mb-2 h-5 text-[10px] uppercase font-bold tracking-wider bg-secondary/10 text-secondary shrink-0 w-fit">
              User Prompt
            </Chip>
            <div className="relative flex-1 overflow-hidden">
              <p className="text-sm text-default-500 whitespace-pre-wrap font-mono leading-relaxed">
                {userText}
              </p>
            </div>
          </div>
        )}

        {/* Tech Stack (Footer Top) */}
        <div className="flex items-center gap-2 mt-auto pt-3 text-xs text-default-400 shrink-0 border-t border-white/5 w-full">
          
          {/* Model Targets */}
          <Tooltip content={models.join(", ")}>
            <div className="flex items-center gap-1 cursor-help">
               <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300">
                 {displayModel}
               </span>
               {extraModelsCount > 0 && (
                 <span className="text-[10px] text-zinc-500">+{extraModelsCount}</span>
               )}
            </div>
          </Tooltip>
        </div>
      </CardBody>
      
      {/* Footer: Action */}
      <CardFooter className="p-5 pt-0 flex justify-between items-center shrink-0 h-[50px] w-full relative z-20">
        <div className="flex gap-2 overflow-hidden mask-linear-fade">
           {(prompt.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-default whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-1 items-center">
          
          {/* Source Link */}
          {sourceUrl && (
            <Tooltip content={`View on ${platform.label}`}>
              <Button
                isIconOnly
                as="a"
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                variant="light"
                className="text-zinc-400 hover:text-white min-w-8 w-8 h-8"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Button>
            </Tooltip>
          )}

          <div className="w-px h-4 bg-white/10 mx-1" />
            
          {/* Dual Copy Buttons for Hybrid Mode */}
          {systemText ? (
            <>
              <CopyButton text={systemText} tooltip="Copy System Instruction" />
              <CopyButton text={userText} tooltip="Copy User Prompt" />
            </>
          ) : (
            <CopyButton text={userText} tooltip="Copy User Prompt" />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
