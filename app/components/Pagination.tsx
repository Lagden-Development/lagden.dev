'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const visiblePages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    visiblePages.push(1);

    if (currentPage > 3) {
      visiblePages.push('...');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    if (currentPage < totalPages - 2) {
      visiblePages.push('...');
    }

    // Always show last page (if not already included)
    if (totalPages > 1) {
      visiblePages.push(totalPages);
    }

    return visiblePages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0 ${className}`}
    >
      {/* Results info */}
      <div className="text-sm text-gray-400">
        Showing <span className="font-medium text-white">{startItem}</span> to{' '}
        <span className="font-medium text-white">{endItem}</span> of{' '}
        <span className="font-medium text-white">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-gray-800 bg-black/50 text-gray-400 hover:border-violet-500/30 hover:bg-black/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-1 text-gray-400"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className={
                  isActive
                    ? 'border-transparent bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 text-white hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                    : 'border-gray-800 bg-black/50 text-gray-400 hover:border-violet-500/30 hover:bg-black/60 hover:text-white'
                }
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-gray-800 bg-black/50 text-gray-400 hover:border-violet-500/30 hover:bg-black/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Go to next page"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
