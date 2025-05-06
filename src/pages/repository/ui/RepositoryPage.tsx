import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { 
  $currentRepository, 
  $loading, 
  $error,
  fetchRepositoryDetailsFx,
  resetCurrentRepository
} from '../../../entities/repository/model/store';
import { RepositoryCard } from '../../../entities/repository/ui/RepositoryCard';
import { Spinner } from '../../../shared/ui/Spinner';
import { Button } from '../../../shared/ui/Button';

export const RepositoryPage = () => {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  
  const [repository, loading, error] = useUnit([
    $currentRepository,
    $loading,
    $error
  ]);
  
  useEffect(() => {
    if (owner && name) {
      fetchRepositoryDetailsFx({ owner, name });
    }
    
    return () => {
      resetCurrentRepository();
    };
  }, [owner, name]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 container py-10">
        <div className="p-6 text-center bg-red-50 text-red-600 rounded-lg">
          <p className="font-medium">Ошибка при загрузке репозитория</p>
          <p className="text-sm mt-1">{error.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }
  
  if (!repository) {
    return (
      <div className="min-h-screen bg-slate-50 container py-10">
        <div className="text-center">
          <p className="text-slate-600">Репозиторий не найден</p>
          <Link to="/">
            <Button variant="primary" className="mt-4">
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-white shadow">
        <div className="container py-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Вернуться к списку
          </Link>
        </div>
      </div>
      
      <main className="container mt-6">
        <RepositoryCard repository={repository} detailed />
      </main>
    </div>
  );
}; 