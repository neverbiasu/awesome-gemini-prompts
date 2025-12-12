"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { FaCheck, FaCopy } from "react-icons/fa";

interface CopyButtonProps {
  text: string;
  tooltip?: string;
  className?: string;
}

export default function CopyButton({ text, tooltip = "Copy", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal or parent click events
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
        className={`transition-all duration-300 min-w-6 w-6 h-6 z-10 ${className} ${
          copied 
            ? "text-emerald-400 bg-emerald-400/10" 
            : "text-zinc-500 hover:text-zinc-200 hover:bg-white/10"
        }`}
        aria-label={tooltip}
      >
        {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
      </Button>
    </Tooltip>
  );
}
