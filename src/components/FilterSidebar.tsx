"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { motion } from "framer-motion";

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

export default function FilterSidebar({ topTags = [] }: { topTags?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  return (
    <aside className="w-full md:w-64 shrink-0 pr-0 md:pr-8 mb-8 md:mb-0">
      <div className="sticky top-24">
         <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-white text-lg">Filters</h2>
            {(searchParams.has("models") || searchParams.has("modality") || searchParams.has("tags")) && (
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
              { label: "Nano / On-Device", value: "nano" },
              { label: "Gemini 3.0", value: "gemini-3.0" },
            ]}
         />

         {topTags.length > 0 && (
            <FilterSection 
                title="Popular Tags"
                paramKey="tags"
                selectedValues={getSelected("tags")}
                onChange={handleFilterChange}
                options={topTags.map(tag => ({ label: tag, value: tag }))}
            />
         )}
      </div>
    </aside>
  );
}
