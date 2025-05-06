import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '../shared/hooks/useDebounce';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';
import { setSearchParams } from '../entities/repository/model/store';

export const SearchHeader = () => {
  // Храним локальное состояние ввода
  const [searchValue, setSearchValue] = useState('');
  // Используем debounce для предотвращения лишних запросов при вводе
  const debouncedSearchValue = useDebounce(searchValue, 500);
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ query: searchValue, page: 1 });
  }, [searchValue]);
  
  // Отправляем запрос при изменении debouncedSearchValue
  useEffect(() => {
    setSearchParams({ query: debouncedSearchValue, page: 1 });
  }, [debouncedSearchValue]);
  
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