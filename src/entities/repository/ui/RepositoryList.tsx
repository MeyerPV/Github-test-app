import type { Repository } from '../../../shared/api/types';
import { RepositoryCard } from './RepositoryCard';
import { RepositoryListSkeleton } from './RepositoryListSkeleton';

export interface RepositoryListProps {
  repositories: Repository[];
  loading?: boolean;
  error?: Error | null;
  itemsPerPage?: number; // To pass to skeleton for correct count
}

export const RepositoryList = ({ 
  repositories, 
  loading = false, 
  error = null,
  itemsPerPage = 10
}: RepositoryListProps) => {
  if (loading && repositories.length === 0) {
    return <RepositoryListSkeleton count={itemsPerPage} />;
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 text-red-600 rounded-lg">
        <p className="font-medium">Ошибка при загрузке данных</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (repositories.length === 0 && !loading) { // Added !loading to prevent showing this if skeleton is shown
    return (
      <div className="text-center py-10 text-slate-500">
        <p>Репозитории не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repositories.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
}; 