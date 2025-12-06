"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Tooltip } from "@heroui/react";
import { GeminiPrompt } from "../schema/prompt";
import { FaGithub, FaReddit, FaGoogle, FaDiscord, FaGlobe, FaCopy, FaCheck, FaExternalLinkAlt, FaPlay } from "react-icons/fa";
import { SiGoogle } from "react-icons/si";

const PLATFORM_CONFIG: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  GitHub: { color: "text-white bg-zinc-800", label: "GitHub", icon: FaGithub },
  Reddit: { color: "text-orange-400 bg-orange-400/10", label: "Reddit", icon: FaReddit },
  Google: { color: "text-blue-400 bg-blue-400/10", label: "Google", icon: SiGoogle },
  UserSubmission: { color: "text-emerald-400 bg-emerald-400/10", label: "Community", icon: FaGlobe },
  Discord: { color: "text-indigo-400 bg-indigo-400/10", label: "Discord", icon: FaDiscord },
};

function CopyButton({ text, tooltip = "Copy", className = "" }: { text: string; tooltip?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    e.preventDefault();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip content={copied ? "Copied!" : tooltip} placement="top" offset={10} className="text-xs z-50">
      <Button
        isIconOnly
        onClick={handleCopy}
        size="sm"
        variant="light"
        className={`transition-all duration-300 min-w-6 w-6 h-6 absolute top-2 right-2 z-10 ${className} ${
          copied 
            ? "text-emerald-400 bg-emerald-400/10" 
            : "text-zinc-500 hover:text-zinc-200 hover:bg-white/10"
        }`}
        aria-label={tooltip}
      >
        {copied ? <FaCheck size={10} /> : <FaCopy size={10} />}
      </Button>
    </Tooltip>
  );
}

export default function PromptCard({ prompt }: { prompt: GeminiPrompt }) {
  // Determine platform with legacy fallback
  let platformKey = prompt.author?.platform;
  if (!platformKey) {
    const source = (prompt as unknown as { sourcePlatform?: string }).sourcePlatform;
    if (source === 'reddit') platformKey = 'Reddit';
    else if (source === 'github') platformKey = 'GitHub';
    else if (source === 'official_docs') platformKey = 'Google';
    else platformKey = 'Google'; // Default fallback
  }
  
  const platform = PLATFORM_CONFIG[platformKey] || PLATFORM_CONFIG.Google;
  const PlatformIcon = platform.icon;

  // Helper to format model list
  const models = prompt.compatibleModels || ["gemini-2.5-pro"];
  const displayModel = models[0].replace('gemini-', '');
  const extraModelsCount = models.length - 1;

  // Extract text content
  const systemText = prompt.systemInstruction?.parts?.[0]?.text;
  const userText = prompt.contents?.[0]?.parts?.[0]?.text || prompt.promptText || "";

  // Handle legacy fields
  const sourceUrl = prompt.originalSourceUrl || (prompt as unknown as { originUrl?: string }).originUrl;
  const legacyMetrics = (prompt as unknown as { metaMetrics?: { stars?: number; upvotes?: number } }).metaMetrics;
  const likes = prompt.stats?.likes || legacyMetrics?.stars || legacyMetrics?.upvotes || 0;

  const handleRunInAIStudio = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Copy full prompt context to clipboard as a backup/convenience
    const textToCopy = systemText ? `System: ${systemText}\n\nUser: ${userText}` : userText;
    await navigator.clipboard.writeText(textToCopy);

    // Construct Deep Link
    const baseUrl = 'https://aistudio.google.com/app/prompts/new_chat';
    const params = new URLSearchParams();
    if (userText) params.append('prompt', userText);
    
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
  };

  return (
    <Card 
      isPressable={false}
      className="group w-full h-[400px] border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-500 rounded-2xl backdrop-blur-md flex flex-col text-left shadow-2xl shadow-black/20"
    >
      {/* Header: Title & Meta */}
      <CardHeader 
        className="flex flex-col items-start gap-4 p-6 pb-2 shrink-0 w-full"
      >
        <div className="flex w-full justify-between items-center">
          <div className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${platform.color} border border-white/5 shadow-sm flex items-center gap-1.5`}>
            <PlatformIcon size={12} />
            {platform.label}
          </div>
          
          {/* Metrics */}
          {likes > 0 && platformKey !== 'Google' && (
            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono bg-white/5 px-2 py-1 rounded-full">
              <div className="flex items-center gap-1" title="Upvotes/Likes">
                <svg className="w-3.5 h-3.5 text-rose-500/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{likes}</span>
              </div>
            </div>
          )}
        </div>
        <Tooltip 
          content={prompt.title} 
          delay={500} 
          placement="top" 
          offset={15}
          className="max-w-[300px] z-[9999] pointer-events-none text-center bg-zinc-950 border border-white/10 shadow-2xl"
        >
          <h3 className="text-xl font-bold text-zinc-100 leading-tight group-hover:text-white transition-colors line-clamp-1 w-full tracking-tight cursor-default">
            {prompt.title}
          </h3>
        </Tooltip>
      </CardHeader>
      
      {/* Body: Content & Specs */}
      <CardBody 
        className="p-6 pt-2 flex flex-col gap-4 overflow-hidden w-full h-full"
      >
        {/* System Prompt */}
        {systemText && (
          <div className={`
            relative flex flex-col min-h-0
            ${userText ? 'h-1/2' : 'flex-1'}
          `}>
            <div className="flex items-center gap-2 mb-1.5">
               <span className="uppercase text-[9px] font-bold text-blue-400 tracking-widest">System Prompt</span>
            </div>
            <div className="relative rounded-xl border border-white/5 bg-black/20 p-3 flex-1 overflow-hidden group/code">
                 <CopyButton text={systemText} tooltip="Copy System Prompt" className="opacity-0 group-hover/code:opacity-100 transition-opacity" />
                 <p className="whitespace-pre-wrap leading-relaxed opacity-80 text-xs font-mono text-zinc-400 line-clamp-3">{systemText}</p>
            </div>
          </div>
        )}

        {/* User Prompt */}
        {userText && (
          <div className={`
            relative flex flex-col min-h-0
            ${systemText ? 'h-1/2' : 'flex-1'}
          `}>
            <div className="flex items-center gap-2 mb-1.5">
               <span className="uppercase text-[9px] font-bold text-zinc-500 tracking-widest">User Prompt</span>
            </div>
            <div className="relative rounded-xl border border-white/5 bg-white/5 p-3 flex-1 overflow-hidden group/code">
              <CopyButton text={userText} tooltip="Copy User Prompt" className="opacity-0 group-hover/code:opacity-100 transition-opacity" />
              <p className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed line-clamp-6">
                {userText}
              </p>
            </div>
          </div>
        )}

        {/* Tech Stack (Footer Top) */}
        <div className="flex items-center gap-2 mt-auto pt-2 text-xs text-zinc-500 shrink-0 w-full">
          {/* Model Targets */}
          <Tooltip content={models.join(", ")} placement="bottom" offset={10} className="z-50">
            <div className="flex items-center gap-1 cursor-help hover:text-zinc-300 transition-colors">
               <span className="px-2 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-[10px]">
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
      <CardFooter className="p-6 pt-0 flex items-center gap-3 shrink-0 h-[60px] w-full relative z-20">
        <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade min-w-0 items-center">
           {(prompt.tags || []).map((tag) => (
            <span key={tag} className="px-2 py-1 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-default whitespace-nowrap shrink-0">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2 items-center shrink-0">
          
          {/* Source Link */}
          {sourceUrl && (
            <Tooltip content={`View on ${platform.label}`} placement="top" offset={10} className="z-50">
              <Button
                isIconOnly
                as="a"
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                variant="light"
                className="text-zinc-500 hover:text-white min-w-8 w-8 h-8"
              >
                {platformKey === 'Reddit' ? <FaReddit size={16} /> : <FaExternalLinkAlt size={14} />}
              </Button>
            </Tooltip>
          )}

          <div className="w-px h-4 bg-white/10 mx-1" />

          {/* Run in AI Studio */}
          <Tooltip content="Run in Google AI Studio" placement="top" offset={10} className="z-50">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-blue-500/10 text-blue-400 font-semibold text-xs min-w-8 w-8 h-8 rounded-full hover:bg-blue-500/20 transition-all flex items-center justify-center"
              onClick={handleRunInAIStudio}
            >
              <FaPlay size={10} />
            </Button>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
}
