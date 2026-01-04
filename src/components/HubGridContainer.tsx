"use client";

import { useState } from "react";
import FilterSidebar from "./FilterSidebar";
import PromptGrid from "./PromptGrid";
import Pagination from "./Pagination";
import { GeminiPrompt } from "@/schema/prompt";

interface HubGridContainerProps {
  prompts: GeminiPrompt[];
  topTags: string[];
  totalItems: number;
  itemsPerPage: number;
}

export default function HubGridContainer({
  prompts,
  topTags,
  totalItems,
  itemsPerPage
}: HubGridContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Filter Sidebar - mobile drawer + desktop sidebar */}
      <FilterSidebar 
        topTags={topTags} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      
      {/* Content Grid */}
      <div className="flex-1 min-w-0">
        <PromptGrid 
          prompts={prompts} 
          isCollapsed={isCollapsed} 
        />
        <Pagination totalItems={totalItems} itemsPerPage={itemsPerPage} />
      </div>
    </div>
  );
}
