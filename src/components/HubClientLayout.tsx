"use client";

import SearchBar from "./SearchBar";
import SortDropdown from "./SortDropdown";
import { motion } from "framer-motion";

interface HubClientLayoutProps {
  children: React.ReactNode;
  totalItems: number;
  updatedDate: string;
}

export default function HubClientLayout({ 
  children, 
  totalItems, 
  updatedDate,
}: HubClientLayoutProps) {
  return (
    <>
      {/* Control Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-[64px] z-30 bg-black/80 backdrop-blur-xl border-y border-white/10 -mx-4 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center gap-4 transition-all"
      >
         {/* Left: Count */}
         <div className="flex items-center gap-6 w-full md:w-auto md:flex-1 justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg">{totalItems}</span>
              <span className="text-zinc-500 text-sm uppercase tracking-wider font-medium">Prompts</span>
            </div>
            
            <div className="h-4 w-px bg-white/10 hidden md:block"></div>
            
            <span className="text-xs text-zinc-600 font-mono hidden md:block">
              Updated: {updatedDate}
            </span>
         </div>
         
         {/* Center: Search */}
         <div className="w-full md:w-auto md:flex-1 flex justify-center order-first md:order-none">
            <div className="w-full max-w-md">
              <SearchBar />
            </div>
         </div>
         
         {/* Right: Sort */}
         <div className="flex items-center gap-4 w-full md:w-auto md:flex-1 justify-end">
            <SortDropdown />
         </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="mt-8">
        {children}
      </div>
    </>
  );
}
