"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/utils";

export const Pagination = ({ page, totalPages }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams()!;

  // Normalize page to be within valid range
  const validPage = Math.max(1, Math.min(Number(page), totalPages));
  
  // If current page is invalid, redirect to valid page
  useEffect(() => {
    if (totalPages > 0 && (Number(page) !== validPage || Number(page) > totalPages)) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "page",
        value: validPage.toString(),
      });
      router.replace(newUrl, { scroll: false });
    }
  }, [page, totalPages, validPage, router, searchParams]);

  const handleNavigation = (type: "prev" | "next") => {
    let pageNumber = type === "prev" ? validPage - 1 : validPage + 1;
    
    // Clamp to valid range
    pageNumber = Math.max(1, Math.min(pageNumber, totalPages));
    
    // Don't navigate if we're already at the boundary
    if (pageNumber === validPage) return;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: pageNumber.toString(),
    });

    router.push(newUrl, { scroll: false });
  };

  // Handle edge case: no pages or invalid totalPages
  if (totalPages <= 0) {
    return null;
  }

  // Handle edge case: only one page
  if (totalPages === 1) {
    return (
      <div className="flex justify-between gap-3">
        <Button
          size="lg"
          variant="ghost"
          className="p-0 hover:bg-transparent"
          disabled={true}
        >
          <Image
            src="/icons/arrow-left.svg"
            alt="arrow"
            width={20}
            height={20}
            className="mr-2"
          />
          Prev
        </Button>
        <p className="text-14 flex items-center px-2">
          1 / 1
        </p>
        <Button
          size="lg"
          variant="ghost"
          className="p-0 hover:bg-transparent"
          disabled={true}
        >
          Next
          <Image
            src="/icons/arrow-left.svg"
            alt="arrow"
            width={20}
            height={20}
            className="ml-2 -scale-x-100"
          />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between gap-3">
      <Button
        size="lg"
        variant="ghost"
        className="p-0 hover:bg-transparent"
        onClick={() => handleNavigation("prev")}
        disabled={validPage <= 1}
      >
        <Image
          src="/icons/arrow-left.svg"
          alt="arrow"
          width={20}
          height={20}
          className="mr-2"
        />
        Prev
      </Button>
      <p className="text-14 flex items-center px-2">
        {validPage} / {totalPages}
      </p>
      <Button
        size="lg"
        variant="ghost"
        className="p-0 hover:bg-transparent"
        onClick={() => handleNavigation("next")}
        disabled={validPage >= totalPages}
      >
        Next
        <Image
          src="/icons/arrow-left.svg"
          alt="arrow"
          width={20}
          height={20}
          className="ml-2 -scale-x-100"
        />
      </Button>
    </div>
  );
};