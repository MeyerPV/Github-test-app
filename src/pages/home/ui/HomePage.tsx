import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { 
  $repositories, 
  $loading, 
  $error, 
  $totalCount, 
  $searchParams,
  setSearchParams,
  fetchRepositoriesTrigger,
  appMounted
} from '../../../features/repository-list/model/list.store';
import { SearchHeader } from '../../../widgets/SearchHeader';
import { RepositoryList } from '../../../features/repository-list/ui/RepositoryList';
import { Pagination } from '../../../shared/ui/Pagination';
import { TokenManager } from '../../../widgets/TokenManager/ui/TokenManager';

export const HomePage = () => {
  // Получаем данные из стора
  const [
    repositories, 
    loading, 
    error, 
    totalCount, 
    searchParams,
    trigger,
    mountApp
  ] = useUnit([
    $repositories, 
    $loading, 
    $error, 
    $totalCount, 
    $searchParams,
    fetchRepositoriesTrigger,
    appMounted
  ]);
  
  const totalPages = Math.ceil(totalCount / searchParams.perPage);
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setSearchParams({ page });
  };
  
  // Загружаем данные при монтировании компонента
  useEffect(() => {
    trigger();
    mountApp();
  }, [trigger, mountApp]);
  
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <SearchHeader />
      
      <main className="container mt-6">
        <TokenManager />

        <div className="flex justify-between items-center mb-6 mt-6">
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
        
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-medium">Ошибка!</span> {error.message || 'Не удалось загрузить данные.'}
          </div>
        )}
        
        <RepositoryList 
          repositories={repositories} 
          loading={loading} 
          error={error}
          itemsPerPage={searchParams.perPage}
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