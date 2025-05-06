import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { 
  $repositories, 
  $loading, 
  $error, 
  $totalCount, 
  $searchParams,
  setSearchParams,
  fetchRepositoriesTrigger
} from '../../../entities/repository/model/store';
import { SearchHeader } from '../../../widgets/SearchHeader';
import { RepositoryList } from '../../../entities/repository/ui/RepositoryList';
import { Pagination } from '../../../shared/ui/Pagination';

export const HomePage = () => {
  // Получаем данные из стора
  const [
    repositories, 
    loading, 
    error, 
    totalCount, 
    searchParams,
    trigger
  ] = useUnit([
    $repositories, 
    $loading, 
    $error, 
    $totalCount, 
    $searchParams,
    fetchRepositoriesTrigger
  ]);
  
  const totalPages = Math.ceil(totalCount / searchParams.perPage);
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setSearchParams({ page });
  };
  
  // Загружаем данные при монтировании компонента
  useEffect(() => {
    trigger();
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <SearchHeader />
      
      <main className="container mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {searchParams.query 
              ? `Результаты поиска: ${searchParams.query}` 
              : 'Ваши репозитории'}
          </h2>
          
          {totalCount > 0 && (
            <p className="text-sm text-slate-600">
              Найдено: {totalCount}
            </p>
          )}
        </div>
        
        <RepositoryList 
          repositories={repositories} 
          loading={loading} 
          error={error}
        />
        
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination 
              currentPage={searchParams.page} 
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}; 