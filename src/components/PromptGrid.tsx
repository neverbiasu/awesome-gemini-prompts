'use client';

import { useState, useEffect } from 'react';
import { GeminiPrompt } from '@/schema/prompt';
import PromptCard from '@/components/PromptCard';

interface PromptGridProps {
  prompts: GeminiPrompt[];
}

const ITEMS_PER_PAGE = 24;

export default function PromptGrid({ prompts }: PromptGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset to page 1 if prompts change (e.g. if we add filtering later)
  useEffect(() => {
    setCurrentPage(1);
  }, [prompts]);

  const totalPages = Math.ceil(prompts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPrompts = prompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
          <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-zinc-500">No prompts found in the database.</p>
        <p className="text-xs text-zinc-600">Run `npm run scrape` to populate data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentPrompts.map((prompt) => (
          <PromptCard key={prompt.id || prompt.originalSourceUrl} prompt={prompt} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8 border-t border-white/5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to show a window of pages around current page
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage > 3) {
                   pageNum = currentPage - 2 + i;
                }
                if (pageNum > totalPages) {
                    pageNum = totalPages - (4 - i);
                }
              }
              
              // Ensure we don't show invalid pages if logic slips (though above should cover it)
              if (pageNum < 1) pageNum = 1;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
      
      <div className="text-center text-xs text-zinc-600">
        Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, prompts.length)} of {prompts.length} prompts
      </div>
    </div>
  );
}
