export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null; // Adjusted to match usage in store.ts where endCursor can be null
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  pageInfo: PageInfo;
} 