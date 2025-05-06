import type { Repository } from '../../../shared/api/types';
import { RepositoryCard } from './RepositoryCard';
import { Spinner } from '../../../shared/ui/Spinner';

export interface RepositoryListProps {
  repositories: Repository[];
  loading?: boolean;
  error?: Error | null;
}

export const RepositoryList = ({ repositories, loading = false, error = null }: RepositoryListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 text-red-600 rounded-lg">
        <p className="font-medium">Ошибка при загрузке данных</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (repositories.length === 0) {
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