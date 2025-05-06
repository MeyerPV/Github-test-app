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
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
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

export interface SearchRepositoriesResponse {
  search: {
    repositoryCount: number;
    pageInfo: PageInfo;
    edges: {
      node: Repository;
    }[];
  };
}

export interface RepositoryDetailsResponse {
  repository: Repository;
}

export interface SearchParams {
  query?: string;
  page: number;
  perPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  pageInfo: PageInfo;
} 