import { useCallback, useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { useDebounce } from '../shared/hooks/useDebounce';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';
import { $searchParams, setSearchParams } from '../features/repository-list/model/list.store';

export const SearchHeader = () => {
  const globalSearchParams = useUnit($searchParams);
  const [searchValue, setSearchValue] = useState(globalSearchParams.query || '');
  const debouncedSearchValue = useDebounce(searchValue, 500);
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ query: searchValue.trim(), page: 1 });
  }, [searchValue]);
  
  useEffect(() => {
    // If debouncedSearchValue is the same as the current global query,
    // and local searchValue also matches (meaning no user input yet that differs from URL derived state),
    // then do nothing to avoid resetting page from URL.
    if (debouncedSearchValue === globalSearchParams.query && searchValue === globalSearchParams.query) {
        return; 
    }

    // Otherwise, if user typed or cleared, update search params with page 1
    setSearchParams({ query: debouncedSearchValue.trim(), page: 1 });

  }, [debouncedSearchValue, globalSearchParams.query, searchValue]);
  
  // Sync local searchValue if global query changes (e.g., from URL on initial load, or back/forward)
  useEffect(() => {
    if (globalSearchParams.query !== searchValue) {
      setSearchValue(globalSearchParams.query || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSearchParams.query]); 

  return (
    <div className="bg-white shadow">
      <div className="container py-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">GitHub Repositories Explorer</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Введите название репозитория"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            fullWidth
            className="flex-1"
          />
          
          <Button type="submit">
            Поиск
          </Button>
        </form>
      </div>
    </div>
  );
}; 