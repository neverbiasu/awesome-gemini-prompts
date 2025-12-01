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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  // Extract unique models, tags, and platforms for filters
  const allModels = Array.from(new Set(prompts.flatMap(p => p.compatibleModels || []))).sort();
  const allTags = Array.from(new Set(prompts.flatMap(p => p.tags || []))).sort();
  const allPlatforms = Array.from(new Set(prompts.map(p => p.author?.platform || "Unknown"))).sort();

  // Filter Logic
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = (prompt.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.contents?.[0]?.parts?.[0]?.text?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesModel = selectedModel === "all" || (prompt.compatibleModels && (prompt.compatibleModels as string[]).includes(selectedModel));
    const matchesTag = selectedTag === "all" || (prompt.tags && prompt.tags.includes(selectedTag));
    const matchesPlatform = selectedPlatform === "all" || (prompt.author?.platform === selectedPlatform);

    return matchesSearch && matchesModel && matchesTag && matchesPlatform;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedModel, selectedTag, selectedPlatform]);

  const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPrompts = filteredPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search prompts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <select 
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 cursor-pointer"
          >
            <option value="all">All Platforms</option>
            {allPlatforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>

          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 cursor-pointer"
          >
            <option value="all">All Models</option>
            {allModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>

          <select 
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 cursor-pointer"
          >
            <option value="all">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-zinc-500">No prompts match your search.</p>
          <button 
            onClick={() => { setSearchTerm(""); setSelectedModel("all"); setSelectedTag("all"); }}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
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
                  
                  // Ensure we don't show invalid pages if logic slips
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
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredPrompts.length)} of {filteredPrompts.length} prompts
          </div>
        </>
      )}
    </div>
  );
}
