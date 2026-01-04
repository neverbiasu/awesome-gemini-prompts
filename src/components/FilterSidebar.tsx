"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterSectionProps {
  title: string;
  options: { label: string; value: string }[];
  paramKey: string;
  selectedValues: string[];
  onChange: (key: string, value: string) => void;
}

function FilterSection({ title, options, paramKey, selectedValues, onChange }: FilterSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-blue-600 border-blue-600"
                    : "border-zinc-700 bg-zinc-900 group-hover:border-zinc-500"
                }`}
                onClick={(e) => {
                   e.preventDefault();
                   onChange(paramKey, option.value);
                }}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"}`}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterSidebar({ 
  topTags = [],
  isCollapsed: externalIsCollapsed,
  setIsCollapsed: externalSetIsCollapsed
}: { 
  topTags?: string[],
  isCollapsed?: boolean,
  setIsCollapsed?: (val: boolean) => void
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false); // For mobile drawer
  
  // Use internal state if props are not provided (backward compatibility)
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const isCollapsed = externalIsCollapsed ?? internalIsCollapsed;
  const setIsCollapsed = externalSetIsCollapsed ?? setInternalIsCollapsed;

  // Helper to sync URL params
  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      const currentValues = current.get(key)?.split(",").filter(Boolean) || [];
      
      let newValues: string[];
      if (currentValues.includes(value)) {
        newValues = currentValues.filter((v) => v !== value);
      } else {
        newValues = [...currentValues, value];
      }

      if (newValues.length > 0) {
        current.set(key, newValues.join(","));
      } else {
        current.delete(key);
      }
      
      // Reset page when filtering
      current.set("page", "1");

      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const getSelected = (key: string) => searchParams.get(key)?.split(",") || [];

  const hasActiveFilters = searchParams.has("models") || searchParams.has("modality") || searchParams.has("tags");

  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-white text-lg">Filters</h2>
        {hasActiveFilters && (
          <button 
            onClick={() => router.push(pathname)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Reset
          </button>
        )}
      </div>

      <FilterSection 
        title="Modality"
        paramKey="modality"
        selectedValues={getSelected("modality")}
        onChange={handleFilterChange}
        options={[
          { label: "Text", value: "text" },
          { label: "Image", value: "image" },
        ]}
      />

      <FilterSection 
        title="Models"
        paramKey="models"
        selectedValues={getSelected("models")}
        onChange={handleFilterChange}
        options={[
          { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
          { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
          { label: "Nano Banana", value: "nano" },
          { label: "Gemini 3.0", value: "gemini-3.0" },
        ]}
      />

      {topTags.length > 0 && (
        <FilterSection 
          title="Popular Tags"
          paramKey="tags"
          selectedValues={getSelected("tags")}
          onChange={handleFilterChange}
          options={topTags.slice(0, 15).map(tag => ({ label: tag, value: tag }))}
        />
      )}
    </>
  );

  return (
    <>
      {/* Mobile: Filter Toggle Button */}
      <div className="md:hidden mb-4 w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/60 border border-white/10 rounded-lg hover:bg-zinc-900/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold text-white">Filters</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          <svg 
            className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-zinc-900/40 border border-white/5 rounded-lg">
                <FilterContent />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: Collapsible Sidebar */}
      <aside 
        className={`hidden md:block shrink-0 transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-64'}`}
      >
        <div className="sticky top-24 pr-4">
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 bg-zinc-900 border border-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"
              title={isCollapsed ? "Expand Filters" : "Collapse Filters"}
            >
              <svg 
                className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <FilterContent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}

