
"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };
  
  // Generate page numbers to display
  const pageNumbers = [];
  const maxPagesToShow = 5; // Max number of page buttons to show
  let startPage, endPage;

  if (totalPages <= maxPagesToShow) {
    // Less than or equal to maxPagesToShow, show all pages
    startPage = 0;
    endPage = totalPages - 1;
  } else {
    // More than maxPagesToShow, calculate start and end pages
    const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrentPage) {
      // Near the start
      startPage = 0;
      endPage = maxPagesToShow - 1;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      // Near the end
      startPage = totalPages - maxPagesToShow;
      endPage = totalPages - 1;
    } else {
      // In the middle
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }


  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrev}
        disabled={!hasPrevPage}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {startPage > 0 && (
        <>
          <Button variant={0 === currentPage ? "default" : "outline"} onClick={() => onPageChange(0)}>1</Button>
          {startPage > 1 && <span className="text-muted-foreground">...</span>}
        </>
      )}

      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          onClick={() => onPageChange(page)}
        >
          {page + 1}
        </Button>
      ))}
      
      {endPage < totalPages - 1 && (
        <>
         {endPage < totalPages - 2 && <span className="text-muted-foreground">...</span>}
          <Button variant={totalPages - 1 === currentPage ? "default" : "outline"} onClick={() => onPageChange(totalPages - 1)}>{totalPages}</Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={!hasNextPage}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
