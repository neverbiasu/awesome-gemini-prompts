"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, Chip } from "@heroui/react";
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
        {/* System Instruction (Persona) */}
        {prompt.systemInstruction && (
          <div className="mb-3 p-3 bg-default-100 rounded-lg border-l-4 border-secondary text-xs font-mono text-default-600">
            <div className="flex justify-between items-center mb-1">
              <div className="uppercase text-[10px] font-bold text-secondary tracking-wider">System Instruction</div>
              <Chip size="sm" variant="flat" color="warning" className="h-5 text-[10px] px-1">API Only</Chip>
            </div>
            {prompt.systemInstruction}
          </div>
        )}

        {/* User Prompt */}
        <div className="relative group">
          <div className="uppercase text-[10px] font-bold text-default-400 mb-1 tracking-wider">User Prompt</div>
          <p className="text-sm text-default-600 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
            {prompt.promptText}
          </p>
        </div>

        {/* Tags & Modality */}
        <div className="flex items-center gap-2 mt-4 text-xs text-default-400">
          {/* Input Modality */}
          <div className="flex gap-1">
            {(prompt.inputModality || ["text"]).map((m) => (
              <Chip key={m} size="sm" variant="flat" color="default" className="capitalize">
                In: {m}
              </Chip>
            ))}
          </div>
          
          <span>→</span>

          {/* Output Modality */}
          <div className="flex gap-1">
            {(prompt.outputModality || ["text"]).map((m) => (
              <Chip key={m} size="sm" variant="flat" color="primary" className="capitalize">
                Out: {m}
              </Chip>
            ))}
          </div>

          <div className="w-px h-3 bg-default-300 mx-1" />

          {/* Model Targets */}
          <div className="flex gap-1">
            {(Array.isArray(prompt.modelTarget) ? prompt.modelTarget : (prompt.modelTarget ? [prompt.modelTarget] : ["gemini-1.5-pro"])).map((model) => (
               <span key={model} className="px-1.5 py-0.5 rounded bg-default-100 border border-default-200 text-[10px]">
                 {model.replace('gemini-', '')}
               </span>
            ))}
          </div>
        </div>
      </CardBody>
      
      {/* Footer: Action */}
      <CardFooter className="p-5 pt-0 flex justify-between items-center border-t border-white/5 mt-auto">
        <div className="flex gap-2 overflow-hidden">
           {(prompt.tags || []).slice(0, 3).map((tag) => (
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
