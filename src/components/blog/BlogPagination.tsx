import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function BlogPagination({ currentPage, totalPages }: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    return page === 1 ? '/blog' : `/blog/page/${page}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Nombre de pages à afficher
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    // Ajuster le début si on est près de la fin
    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // Ajouter la première page et les ellipses si nécessaire
    if (startPage > 1) {
      pages.push(
        <Link key={1} to={getPageUrl(1)}>
          <Button
            variant={1 === currentPage ? "default" : "outline"}
            size="sm"
            className="min-w-[40px]"
            aria-current={1 === currentPage ? "page" : undefined}
          >
            1
          </Button>
        </Link>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-coffee-dark">
            ...
          </span>
        );
      }
    }

    // Ajouter les pages dans la plage
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link key={i} to={getPageUrl(i)}>
          <Button
            variant={i === currentPage ? "default" : "outline"}
            size="sm"
            className="min-w-[40px]"
            aria-current={i === currentPage ? "page" : undefined}
          >
            {i}
          </Button>
        </Link>
      );
    }

    // Ajouter les ellipses et la dernière page si nécessaire
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-coffee-dark">
            ...
          </span>
        );
      }
      pages.push(
        <Link key={totalPages} to={getPageUrl(totalPages)}>
          <Button
            variant={totalPages === currentPage ? "default" : "outline"}
            size="sm"
            className="min-w-[40px]"
            aria-current={totalPages === currentPage ? "page" : undefined}
          >
            {totalPages}
          </Button>
        </Link>
      );
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center space-x-2 mt-8" aria-label="Pagination du blog">
      {/* Page précédente */}
      {currentPage > 1 && (
        <Link to={getPageUrl(currentPage - 1)}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédente
          </Button>
        </Link>
      )}

      {/* Numéros de pages */}
      <div className="flex items-center space-x-1">
        {renderPageNumbers()}
      </div>

      {/* Page suivante */}
      {currentPage < totalPages && (
        <Link to={getPageUrl(currentPage + 1)}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-label="Page suivante"
          >
            Suivante
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </nav>
  );
}