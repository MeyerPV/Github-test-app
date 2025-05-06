import type { PageInfo } from './common.types';

export interface Owner {
  login: string;
  avatarUrl: string;
  url: string;
}

export interface Language {
  id: string;
  name: string;
  color: string;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  stargazerCount: number;
  owner: Owner;
  defaultBranchRef?: {
    target: {
      committedDate: string;
    };
  };
  description?: string;
  languages: {
    nodes: Language[];
  };
  // Add other repository-specific fields as needed
  // For example, from GET_REPOSITORY_DETAILS if it has more fields
  // watchersCount?: number;
  // forkCount?: number;
  // openIssuesCount?: number;
  // etc.
}

export interface RepositoriesResponse {
  viewer: {
    repositories: {
      totalCount: number;
      pageInfo: PageInfo;
      nodes: Repository[];
    };
  };
}

export interface RepositoryDetailsResponse {
  repository: Repository; // Assuming details might enhance the base Repository type in future
} 