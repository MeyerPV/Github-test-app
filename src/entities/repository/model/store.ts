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
export const fetchRepositoriesTrigger = createEvent();

// Effects
export const fetchUserRepositoriesFx = createEffect(async (params: { perPage: number; endCursor: string | null }) => {
  const { data } = await githubClient.query<RepositoriesResponse>({
    query: GET_USER_REPOSITORIES,
    variables: {
      first: params.perPage,
      after: params.endCursor,
    },
    fetchPolicy: 'cache-first', // Принудительно используем сеть, избегая кеш
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
    fetchPolicy: 'cache-first', // Принудительно используем сеть, избегая кеш
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
    fetchPolicy: 'cache-first', // Принудительно используем сеть, избегая кеш
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
export const $pageMap = createStore<Record<number, string | null>>({});

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

// Единая логика обработки данных для обоих типов запросов
$repositories
  .on(resetRepositories, () => [])
  .on(fetchUserRepositoriesFx.doneData, (_, { repositories }) => repositories)
  .on(searchRepositoriesFx.doneData, (_, { repositories }) => repositories);

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

// Сохраняем маппинг страниц к курсорам для правильной пагинации
$pageMap
  .on(fetchUserRepositoriesFx.doneData, (state, { pageInfo }) => {
    const currentPage = $searchParams.getState().page;
    return {
      ...state,
      [currentPage + 1]: pageInfo.endCursor
    };
  })
  .on(searchRepositoriesFx.doneData, (state, { pageInfo }) => {
    const currentPage = $searchParams.getState().page;
    return {
      ...state,
      [currentPage + 1]: pageInfo.endCursor
    };
  })
  .reset(resetRepositories);

// Reset repositories and pageMap when query changes
sample({
  source: $searchParams,
  clock: setSearchParams,
  filter: (state, params) => params.query !== undefined && params.query !== state.query,
  target: [resetRepositories, fetchRepositoriesTrigger],
});

// Reset page to 1 when query changes
sample({
  source: $searchParams,
  clock: setSearchParams,
  filter: (state, params) => params.query !== undefined && params.query !== state.query,
  fn: (state) => ({ ...state, page: 1 }),
  target: $searchParams,
});

// Единый механизм запуска запросов
export const fetchRepositoriesLogic = sample({
  clock: [setSearchParams, fetchRepositoriesTrigger],
  source: $searchParams,
  fn: (params) => {
    const page = params.page || 1;
    const hasQuery = !!params.query;
    
    return { 
      params,
      hasQuery,
      page
    };
  }
});

// Тип для результата fetchRepositoriesLogic
type FetchRepoLogicResult = {
  params: SearchParams;
  hasQuery: boolean;
  page: number;
};

// Для пользовательских репозиториев
sample({
  clock: fetchRepositoriesLogic,
  source: $pageMap,
  filter: (_, payload: FetchRepoLogicResult) => !payload.hasQuery,
  fn: (pageMap, payload: FetchRepoLogicResult) => {
    // Для первой страницы курсор всегда null
    const endCursor = payload.page === 1 ? null : pageMap[payload.page] || null;
    
    return {
      perPage: payload.params.perPage,
      endCursor
    };
  },
  target: fetchUserRepositoriesFx
});

// Для поиска репозиториев
sample({
  clock: fetchRepositoriesLogic,
  source: $pageMap,
  filter: (_, payload: FetchRepoLogicResult) => !!payload.hasQuery,
  fn: (pageMap, payload: FetchRepoLogicResult) => {
    // Для первой страницы курсор всегда null
    const endCursor = payload.page === 1 ? null : pageMap[payload.page] || null;
    
    return {
      query: payload.params.query || "",
      perPage: payload.params.perPage,
      endCursor
    };
  },
  target: searchRepositoriesFx
}); 