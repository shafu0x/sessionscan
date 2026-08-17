import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function TablePagination({
  currentPage,
  pageCount,
  totalItems,
  pageSize,
  hrefForPage,
}: {
  currentPage: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalItems <= pageSize) return null;

  return (
    <div className="flex justify-center border-t pt-4 text-muted-foreground text-sm">
      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link href={hrefForPage(currentPage - 1)} scroll={false}>
              <ChevronLeftIcon aria-hidden />
              Previous
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="min-h-11"
          >
            <ChevronLeftIcon aria-hidden />
            Previous
          </Button>
        )}
        <span className="min-w-16 text-center">
          {currentPage} / {pageCount}
        </span>
        {currentPage < pageCount ? (
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link href={hrefForPage(currentPage + 1)} scroll={false}>
              Next
              <ChevronRightIcon aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="min-h-11"
          >
            Next
            <ChevronRightIcon aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
