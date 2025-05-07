import { createStore, createEvent, createEffect, sample } from 'effector';
// import { persist } from 'effector-storage/local'; // Commented out if not used elsewhere for other stores
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
  RepositoryDetailsResponse,
  PageInfo
} from '../../../shared/api/types';
import type { FetchPolicy } from '@apollo/client';

// Number of repositories per page
const ITEMS_PER_PAGE = 10;

// --- 1. Domain Events (Declare all events first) ---
export const setSearchParams = createEvent<Partial<SearchParams>>();
export const resetRepositories = createEvent();
export const resetCurrentRepository = createEvent();
export const fetchRepositoriesTrigger = createEvent();
const bridgingPageFetched = createEvent<{ nextPageNumber: number; endCursor: string | null }>();
const appMounted = createEvent();

// --- 2. Stores (Declare stores that don't depend on effects yet) ---
// Function to get initial search params from URL (used by $searchParams)
const getInitialSearchParams = (): SearchParams => {
  console.log('[DEBUG store.ts] getInitialSearchParams called. window.location.search:', window.location.search);
  const params = new URLSearchParams(window.location.search);
  const query = params.get('query') || '';
  const page = parseInt(params.get('page') || '1', 10);
  const initial: SearchParams = {
    query,
    page: isNaN(page) || page < 1 ? 1 : page,
    perPage: ITEMS_PER_PAGE,
  };
  console.log('[DEBUG store.ts] Initial searchParams from URL:', initial);
  return initial;
};

export const $searchParams = createStore<SearchParams>(getInitialSearchParams())
  .on(setSearchParams, (state, payload) => {
    const newState: SearchParams = { ...state, ...payload };
    const urlParams = new URLSearchParams();
    if (newState.query) urlParams.set('query', newState.query);
    if (newState.page) urlParams.set('page', newState.page.toString());
    const searchString = urlParams.toString();
    const newUrl = `${window.location.pathname}${searchString ? '?' + searchString : ''}`;
    if (window.history.replaceState) window.history.replaceState({ path: newUrl }, '', newUrl);
    console.log('[DEBUG store.ts] $searchParams updated URL to:', newUrl, 'New state:', newState);
    return newState;
  });

export const $repositories = createStore<Repository[]>([]);
export const $currentRepository = createStore<Repository | null>(null);
export const $error = createStore<Error | null>(null);
export const $totalCount = createStore(0);
export const $hasNextPage = createStore(false);
export const $endCursor = createStore<string | null>(null);
export const $pageMap = createStore<Record<number, string | null>>({})
  .on(bridgingPageFetched, (state, { nextPageNumber, endCursor }) => ({
    ...state,
    [nextPageNumber]: endCursor,
  }));

// --- 3. Effects (Declare all effects) ---
// Define return types for effects explicitly for clarity
type UserReposEffectResult = RepositoriesResponse['viewer']['repositories'];
type SearchReposEffectResult = SearchRepositoriesResponse['search'];

export const fetchUserRepositoriesFx = createEffect(async (params: { perPage: number; endCursor: string | null }): Promise<UserReposEffectResult> => {
  const { data } = await githubClient.query<RepositoriesResponse>({
    query: GET_USER_REPOSITORIES,
    variables: { first: params.perPage, after: params.endCursor },
    fetchPolicy: 'cache-first' as FetchPolicy,
  });
  return data.viewer.repositories;
});

export const searchRepositoriesFx = createEffect(async (params: { query: string; perPage: number; endCursor: string | null }): Promise<SearchReposEffectResult> => {
  const { data } = await githubClient.query<SearchRepositoriesResponse>({
    query: SEARCH_REPOSITORIES,
    variables: { query: params.query, first: params.perPage, after: params.endCursor },
    fetchPolicy: 'cache-first' as FetchPolicy,
  });
  return data.search;
});

export const fetchRepositoryDetailsFx = createEffect(async (params: { owner: string; name: string }): Promise<RepositoryDetailsResponse['repository']> => {
  const { data } = await githubClient.query<RepositoryDetailsResponse>({
    query: GET_REPOSITORY_DETAILS,
    variables: { owner: params.owner, name: params.name },
    fetchPolicy: 'cache-first' as FetchPolicy,
  });
  return data.repository;
});

export const fetchPagesSequentiallyFx = createEffect(
  async ({ targetPage, query, perPage }: { targetPage: number; query?: string; perPage: number }): Promise<{ success: boolean }> => {
    console.log(`[DEBUG store.ts] fetchPagesSequentiallyFx started for targetPage: ${targetPage}`);
    try {
      for (let currentPageToFetch = 1; currentPageToFetch < targetPage; currentPageToFetch++) {
        const pageMapSnapshot = $pageMap.getState();
        const cursorForCurrentPageToFetch = currentPageToFetch === 1 ? null : pageMapSnapshot[currentPageToFetch];
        if (currentPageToFetch > 1 && !cursorForCurrentPageToFetch) {
          throw new Error(`Missing cursor for page ${currentPageToFetch} in sequential fetch. Map: ${JSON.stringify(pageMapSnapshot)}`);
        }
        console.log(`[DEBUG store.ts] Sequentially fetching page ${currentPageToFetch} with cursor: ${cursorForCurrentPageToFetch}`);
        let pageInfo: PageInfo | null | undefined = null;
        const fetchPolicyForBridging = 'network-only' as FetchPolicy;
        if (query) {
          const response = await githubClient.query<SearchRepositoriesResponse>({
            query: SEARCH_REPOSITORIES, variables: { query, first: perPage, after: cursorForCurrentPageToFetch }, fetchPolicy: fetchPolicyForBridging,
          });
          pageInfo = response.data?.search?.pageInfo;
        } else {
          const response = await githubClient.query<RepositoriesResponse>({
            query: GET_USER_REPOSITORIES, variables: { first: perPage, after: cursorForCurrentPageToFetch }, fetchPolicy: fetchPolicyForBridging,
          });
          pageInfo = response.data?.viewer?.repositories?.pageInfo;
        }
        if (pageInfo) {
          bridgingPageFetched({ nextPageNumber: currentPageToFetch + 1, endCursor: pageInfo.endCursor || null });
        } else {
          throw new Error(`Failed to get pageInfo for page ${currentPageToFetch} during sequential fetch.`);
        }
      }
      return { success: true };
    } catch (error) {
      console.error('[DEBUG store.ts] Error during sequential fetch:', error);
      throw error;
    }
  },
);

// --- 4. Stores that depend on effects & other logic ---
export const $isFetchingBridgingPages = createStore(false)
  .on(fetchPagesSequentiallyFx.pending, (_, pending) => pending);

// const $wasSearchActive = createStore(false)
//   .on(searchRepositoriesFx.doneData, () => true)
//   .on(fetchUserRepositoriesFx.doneData, () => false);

export const $loading = createStore(false)
  .on(fetchUserRepositoriesFx.pending, (_, isPending) => isPending || $isFetchingBridgingPages.getState()) // Обновлено
  .on(searchRepositoriesFx.pending, (_, isPending) => isPending || $isFetchingBridgingPages.getState()) // Обновлено
  .on(fetchRepositoryDetailsFx.pending, (_, isPending) => isPending) // Оставляем как есть, если не зависит от bridging
  .on(fetchPagesSequentiallyFx.pending, (_, isPending) => isPending); // Этот эффект сам по себе управляет $isFetchingBridgingPages, и $loading должен быть true если он pending.

  const anyEffectFinally = sample({
    clock: [
      fetchUserRepositoriesFx.finally,
      searchRepositoriesFx.finally,
      fetchRepositoryDetailsFx.finally,
      fetchPagesSequentiallyFx.finally,
    ]
  });

  // Set loading to false only if ALL effects are no longer pending
  $loading.on(anyEffectFinally, () => {
    const stillPending =
      fetchUserRepositoriesFx.pending.getState() ||
      searchRepositoriesFx.pending.getState() ||
      fetchRepositoryDetailsFx.pending.getState() ||
      fetchPagesSequentiallyFx.pending.getState(); // $isFetchingBridgingPages is true if fetchPagesSequentiallyFx is pending
    return stillPending;
  });

// --- 5. Store updaters based on effects ---
$error
  .on(fetchUserRepositoriesFx.failData, (_, error: Error) => error)
  .on(searchRepositoriesFx.failData, (_, error: Error) => error)
  .on(fetchRepositoryDetailsFx.failData, (_, error: Error) => error)
  .on(fetchPagesSequentiallyFx.failData, (_, error: Error) => error)
  .reset(fetchUserRepositoriesFx)
  .reset(searchRepositoriesFx)
  .reset(fetchRepositoryDetailsFx)
  .reset(fetchPagesSequentiallyFx);

$repositories
  .on(resetRepositories, () => [])
  .on(fetchUserRepositoriesFx.doneData, (_, { nodes }) => nodes)
  .on(searchRepositoriesFx.doneData, (_, { edges }) => edges.map(edge => edge.node));

$currentRepository
  .on(resetCurrentRepository, () => null)
  .on(fetchRepositoryDetailsFx.doneData, (_, repo) => repo);

$totalCount
  .on(fetchUserRepositoriesFx.doneData, (_, { totalCount }) => totalCount)
  .on(searchRepositoriesFx.doneData, (_, { repositoryCount }) => repositoryCount)
  .reset(resetRepositories);

$hasNextPage
  .on(fetchUserRepositoriesFx.doneData, (_, { pageInfo }) => pageInfo.hasNextPage)
  .on(searchRepositoriesFx.doneData, (_, { pageInfo }) => pageInfo.hasNextPage)
  .reset(resetRepositories);

$endCursor
  .on(fetchUserRepositoriesFx.doneData, (_, { pageInfo }) => pageInfo.endCursor)
  .on(searchRepositoriesFx.doneData, (_, { pageInfo }) => pageInfo.endCursor)
  .reset(resetRepositories);

// $pageMap is already updated by bridgingPageFetched event and also needs to be updated by regular fetches
$pageMap
  .on(fetchUserRepositoriesFx.doneData, (state, { pageInfo }) => {
    const currentPage = $searchParams.getState().page;
    return { ...state, [currentPage + 1]: pageInfo.endCursor || null };
  })
  .on(searchRepositoriesFx.doneData, (state, { pageInfo }) => {
    const currentPage = $searchParams.getState().page;
    return { ...state, [currentPage + 1]: pageInfo.endCursor || null };
  })
  .reset(resetRepositories);

// --- 6. Sample logic / Business logic ---
sample({ // Reset repositories and pageMap when query changes
  source: $searchParams,
  clock: setSearchParams,
  filter: (state, params) => params.query !== undefined && params.query !== state.query,
  target: [resetRepositories, fetchRepositoriesTrigger],
});

sample({ // Reset page to 1 when query changes
  source: $searchParams,
  clock: setSearchParams,
  filter: (state, params) => params.query !== undefined && params.query !== state.query,
  fn: (state) => ({ ...state, page: 1 }),
  target: $searchParams,
});

// Explicit type for the result of fetchRepositoriesLogic.fn
type FetchRepositoriesLogicFnResult = {
  finalParams: { query: string; page: number; perPage: number; }; 
  hasQuery: boolean; 
  page: number; 
  endCursor: string | null; 
};

export const fetchRepositoriesLogic = sample({
  clock: [setSearchParams, fetchRepositoriesTrigger],
  source: { params: $searchParams, map: $pageMap },
  fn: ({ params, map }): FetchRepositoriesLogicFnResult => ({ 
    finalParams: { ...params, query: params.query || '' }, 
    hasQuery: !!params.query, 
    page: params.page || 1, 
    endCursor: (params.page || 1) > 1 ? map[params.page || 1] || null : null 
  })
});

sample({
  clock: fetchRepositoriesLogic,
  filter: (d: FetchRepositoriesLogicFnResult): d is FetchRepositoriesLogicFnResult & { hasQuery: true } => d.hasQuery,
  fn: (d) => ({ query: d.finalParams.query, perPage: d.finalParams.perPage, endCursor: d.endCursor }),
  target: searchRepositoriesFx,
});

sample({
  clock: fetchRepositoriesLogic,
  filter: (d: FetchRepositoriesLogicFnResult): d is FetchRepositoriesLogicFnResult & { hasQuery: false } => !d.hasQuery,
  fn: (d) => ({ perPage: d.finalParams.perPage, endCursor: d.endCursor }),
  target: fetchUserRepositoriesFx,
});

appMounted.watch(() => {
  console.log('[DEBUG store.ts] appMounted event *itself* was called/triggered!');
});

const initialLoadCheck = sample({
  clock: appMounted,
  source: { params: $searchParams, map: $pageMap },
  fn: (data) => {
    console.log('[DEBUG store.ts] initialLoadCheck triggered. Data:', JSON.parse(JSON.stringify(data)));
    return data;
  }
});

sample({ // Branch 1: Cold start on page > 1, trigger sequential fetch
  clock: initialLoadCheck,
  filter: ({ params, map }) => params.page > 1 && !map[params.page],
  fn: ({ params }) => {
    console.warn(`[DEBUG store.ts] Branch 1: Cold start on page ${params.page}. Triggering sequential fetch.`);
    return { targetPage: params.page, query: params.query, perPage: params.perPage };
  },
  target: fetchPagesSequentiallyFx,
});

sample({ // Branch 2: Page 1 or page > 1 with existing cursor, trigger direct fetch
  clock: initialLoadCheck,
  filter: ({ params, map }) => params.page === 1 || (params.page > 1 && !!map[params.page]),
  fn: ({ params }) => {
    console.log(`[DEBUG store.ts] Branch 2: Page ${params.page} is page 1 or cursor exists. Triggering direct fetch.`);
  },
  target: fetchRepositoriesTrigger,
});

sample({ // After sequential fetch completes, trigger final data load for target page
  clock: fetchPagesSequentiallyFx.doneData,
  target: fetchRepositoriesTrigger,
});

export { appMounted }; 