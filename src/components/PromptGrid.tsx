'use client';

import { GeminiPrompt } from '@/schema/prompt';
import PromptCard from '@/components/PromptCard';
import { motion } from 'framer-motion';

interface PromptGridProps {
  prompts: GeminiPrompt[];
  isCollapsed?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function PromptGrid({ prompts, isCollapsed = false }: PromptGridProps) {
  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
          <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-zinc-500">No prompts match your search.</p>
      </div>
    );
  }

  const gridKey = prompts.map(p => p.id).join('-');

  return (
    <motion.div 
      key={gridKey}
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-300 ${isCollapsed ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}
    >
      {prompts.map((prompt) => (
        <motion.div key={prompt.id || prompt.originalSourceUrl} variants={item}>
            <PromptCard prompt={prompt} />
        </motion.div>
      ))}
    </motion.div>
  );
}
