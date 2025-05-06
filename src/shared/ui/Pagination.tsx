import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  maxVisiblePages?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  maxVisiblePages = 10,
  onPageChange,
  className,
}: PaginationProps) => {
  const pages = useMemo(() => {
    // Ограничиваем количество страниц до maxVisiblePages
    const visiblePages = Math.min(totalPages, maxVisiblePages);
    
    // Если totalPages <= maxVisiblePages, показываем все страницы
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Иначе показываем страницы вокруг текущей
    let startPage = Math.max(currentPage - Math.floor(visiblePages / 2), 1);
    let endPage = startPage + visiblePages - 1;
    
    // Если endPage превышает totalPages, сдвигаем startPage
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - visiblePages + 1, 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [currentPage, totalPages, maxVisiblePages]);
  
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <nav className={twMerge('flex justify-center', className)}>
      <ul className="inline-flex -space-x-px">
        <li>
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 ml-0 leading-tight text-slate-500 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            Пред.
          </button>
        </li>
        
        {pages.map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 leading-tight border hover:bg-slate-100 ${
                currentPage === page
                  ? 'text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                  : 'text-slate-500 bg-white border-slate-300 hover:text-slate-700'
              }`}
            >
              {page}
            </button>
          </li>
        ))}
        
        <li>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 leading-tight text-slate-500 bg-white border border-slate-300 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            След.
          </button>
        </li>
      </ul>
    </nav>
  );
}; 