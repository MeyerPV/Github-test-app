import type { Repository } from '../../../shared/api/types'; // Corrected path
import { RepositoryCard } from '../../../entities/repository/ui/RepositoryCard'; // Path to entity component
import { RepositoryListSkeleton } from './RepositoryListSkeleton'; // Corrected path

export interface RepositoryListProps {
  repositories: Repository[];
  loading?: boolean;
  error?: Error | null;
  itemsPerPage?: number; 
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
        <p className="font-medium">Error loading data</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (repositories.length === 0 && !loading) { 
    return (
      <div className="text-center py-10 text-slate-500">
        <p>Repositories not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repositories.map((repo) => (
        // RepositoryCard is an entity, so it's imported from entities layer
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
}; 