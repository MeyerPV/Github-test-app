import { RepositoryCardSkeleton } from './RepositoryCardSkeleton';

interface RepositoryListSkeletonProps {
  count?: number;
}

export const RepositoryListSkeleton = ({ count = 10 }: RepositoryListSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <RepositoryCardSkeleton key={index} />
      ))}
    </div>
  );
}; 