import type { PageInfo } from './common.types';
import type { Repository } from './repository.types';

export interface SearchParams {
  query?: string;      // Query can be optional if we fetch all user repos by default
  page: number;        // Current page number, 1-indexed
  perPage: number;     // Items per page
}

export interface SearchRepositoriesResponse {
  search: {
    repositoryCount: number;
    pageInfo: PageInfo;
    edges: {
      node: Repository;
    }[];
  };
} 