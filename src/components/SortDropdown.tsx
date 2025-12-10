"use client";

import { Select, SelectItem } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaSortAmountDown } from "react-icons/fa";

const SORT_OPTIONS = [
  { key: "relevance", label: "Recommended" },
  { key: "newest", label: "Newest" },
  { key: "popular", label: "Most Popular" },
];

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "relevance";

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (sort && sort !== "relevance") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    
    // Reset page to 1 on sort change
    params.delete("page");
    
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Select 
      label="Sort by"
      placeholder="Select an option"
      selectedKeys={[currentSort]}
      className="max-w-xs min-w-[140px]"
      onChange={handleSelectionChange}
      variant="underlined"
      classNames={{
        label: "text-zinc-500 text-xs uppercase tracking-wider font-bold group-data-[filled=true]:-translate-y-4",
        value: "text-white font-medium text-sm",
        trigger: "border-b border-white/20 data-[hover=true]:border-white transition-colors",
        popoverContent: "bg-zinc-900 border border-white/10 text-zinc-300",
      }}
      disallowEmptySelection
    >
      {SORT_OPTIONS.map((option) => (
        <SelectItem key={option.key} className="text-zinc-300 data-[hover=true]:bg-white/10 data-[hover=true]:text-white">
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}
