import { createStore, createEvent, createEffect, sample } from 'effector';
import { persist } from 'effector-storage/local';
import { githubClient } from '../../../shared/api/github';
import { 
  GET_USER_REPOSITORIES, 
  SEARCH_REPOSITORIES,
  GET_REPOSITORY_DETAILS 
} from '../../../shared/api/queries';
import type { 
  Repository, 
  SearchParams,
  RepositoriesResponse,
  SearchRepositoriesResponse,
  RepositoryDetailsResponse
} from '../../../shared/api/types';

// Количество репозиториев на страницу
const ITEMS_PER_PAGE = 10;

// Domain
// Events
export const setSearchParams = createEvent<Partial<SearchParams>>();
export const resetRepositories = createEvent();
export const resetCurrentRepository = createEvent();

// Effects
export const fetchUserRepositoriesFx = createEffect(async (params: { perPage: number; endCursor: string | null }) => {
  const { data } = await githubClient.query<RepositoriesResponse>({
    query: GET_USER_REPOSITORIES,
    variables: {
      first: params.perPage,
      after: params.endCursor,
    },
  });
  
  return {
    repositories: data.viewer.repositories.nodes,
    totalCount: data.viewer.repositories.totalCount,
    pageInfo: data.viewer.repositories.pageInfo,
  };
});

export const searchRepositoriesFx = createEffect(async (params: { query: string; perPage: number; endCursor: string | null }) => {
  const { data } = await githubClient.query<SearchRepositoriesResponse>({
    query: SEARCH_REPOSITORIES,
    variables: {
      query: params.query,
      first: params.perPage,
      after: params.endCursor,
    },
  });
  
  return {
    repositories: data.search.edges.map((edge) => edge.node),
    totalCount: data.search.repositoryCount,
    pageInfo: data.search.pageInfo,
  };
});

export const fetchRepositoryDetailsFx = createEffect(async (params: { owner: string; name: string }) => {
  const { data } = await githubClient.query<RepositoryDetailsResponse>({
    query: GET_REPOSITORY_DETAILS,
    variables: { owner: params.owner, name: params.name },
  });
  
  return data.repository;
});

// Stores
export const $searchParams = createStore<SearchParams>({
  query: '',
  page: 1,
  perPage: ITEMS_PER_PAGE,
});

export const $repositories = createStore<Repository[]>([]);
export const $currentRepository = createStore<Repository | null>(null);
export const $loading = createStore(false);
export const $error = createStore<Error | null>(null);
export const $totalCount = createStore(0);
export const $hasNextPage = createStore(false);
export const $endCursor = createStore<string | null>(null);

// Persistence
persist({
  store: $searchParams,
  key: 'github-search-params',
});

// Updates
$searchParams.on(setSearchParams, (state, payload) => ({
  ...state,
  ...payload,
}));

$repositories
  .on(resetRepositories, () => [])
  .on(fetchUserRepositoriesFx.doneData, (state, { repositories }) => repositories)
  .on(searchRepositoriesFx.doneData, (state, { repositories }) => repositories);

$currentRepository
  .on(resetCurrentRepository, () => null)
  .on(fetchRepositoryDetailsFx.doneData, (_, repository) => repository);

$loading
  .on(fetchUserRepositoriesFx.pending, (_, pending) => pending)
  .on(searchRepositoriesFx.pending, (_, pending) => pending)
  .on(fetchRepositoryDetailsFx.pending, (_, pending) => pending);

$error
  .on(fetchUserRepositoriesFx.failData, (_, error) => error)
  .on(searchRepositoriesFx.failData, (_, error) => error)
  .on(fetchRepositoryDetailsFx.failData, (_, error) => error)
  .reset(fetchUserRepositoriesFx)
  .reset(searchRepositoriesFx)
  .reset(fetchRepositoryDetailsFx);

$totalCount
  .on(fetchUserRepositoriesFx.doneData, (_, { totalCount }) => totalCount)
  .on(searchRepositoriesFx.doneData, (_, { totalCount }) => totalCount)
  .reset(resetRepositories);

$hasNextPage
  .on(fetchUserRepositoriesFx.doneData, (_, { pageInfo }) => pageInfo.hasNextPage)
  .on(searchRepositoriesFx.doneData, (_, { pageInfo }) => pageInfo.hasNextPage)
  .reset(resetRepositories);

$endCursor
  .on(fetchUserRepositoriesFx.doneData, (_, { pageInfo }) => pageInfo.endCursor)
  .on(searchRepositoriesFx.doneData, (_, { pageInfo }) => pageInfo.endCursor)
  .reset(resetRepositories);

// Reset repositories when query changes
sample({
  source: $searchParams,
  clock: setSearchParams,
  filter: (state, params) => params.query !== undefined && params.query !== state.query,
  target: resetRepositories,
});

// Logic
export const fetchRepositories = createEffect(() => {
  const searchParams = $searchParams.getState();
  const endCursor = $endCursor.getState();
  
  // Если запрашиваемая страница - первая, курсор должен быть null
  const cursorForRequest = searchParams.page === 1 ? null : endCursor;
  
  if (!searchParams.query) {
    return fetchUserRepositoriesFx({ perPage: searchParams.perPage, endCursor: cursorForRequest });
  }
  
  return searchRepositoriesFx({ 
    query: searchParams.query, 
    perPage: searchParams.perPage, 
    endCursor: cursorForRequest 
  });
});

// Update stores on query or page change
sample({
  source: $searchParams,
  clock: setSearchParams,
  target: fetchRepositories,
}); 