"use client";

import { useState, useEffect, useRef } from "react";
import { Input, Kbd } from "@heroui/react";
import { FaSearch } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce"; // We'll need to create this hook or implement debounce inline

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search to avoid excessive URL updates
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (currentQ === debouncedQuery) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    // Reset page to 1 on search
    params.delete("page");
    
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router, searchParams]);

  // Keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-xl relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
      <Input
        ref={inputRef}
        classNames={{
          base: "max-w-full h-10",
          mainWrapper: "h-full",
          input: "text-small",
          inputWrapper: "h-full font-normal text-default-500 bg-black hover:bg-zinc-900 group-data-[focus=true]:bg-zinc-900 border border-white/10 transition-colors rounded-full",
        }}
        placeholder="Search"
        size="sm"
        startContent={<div className="bg-transparent p-1"><FaSearch size={14} className="text-zinc-400" /></div>}
        type="search"
        value={query}
        onValueChange={setQuery}
        isClearable={false}
      />
    </div>
  );
}
