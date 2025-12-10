"use client";

import { Button, Input } from "@heroui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({ totalItems, itemsPerPage }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (!isNaN(page)) {
      handlePageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 py-8 mt-8 border-t border-white/5">
      <Button
        isIconOnly
        variant="flat"
        className="bg-white/5 hover:bg-white/10 text-white"
        isDisabled={currentPage === 1}
        onPress={() => handlePageChange(currentPage - 1)}
      >
        <FaChevronLeft />
      </Button>

      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span>Page</span>
        <form onSubmit={handleInputSubmit} className="flex items-center">
          <Input
            classNames={{
              input: "text-center text-small",
              inputWrapper: "h-8 w-12 min-h-unit-8 bg-zinc-900 border border-white/10",
            }}
            value={inputPage}
            onValueChange={setInputPage}
            size="sm"
          />
        </form>
        <span>of {totalPages}</span>
      </div>

      <Button
        isIconOnly
        variant="flat"
        className="bg-white/5 hover:bg-white/10 text-white"
        isDisabled={currentPage === totalPages}
        onPress={() => handlePageChange(currentPage + 1)}
      >
        <FaChevronRight />
      </Button>
    </div>
  );
}
