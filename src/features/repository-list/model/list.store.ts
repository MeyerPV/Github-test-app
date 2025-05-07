// This file will contain the Effector store for the repository list feature
// (search, pagination, bridging pages, etc.) 

import { createStore, createEvent, createEffect, sample } from 'effector';
// import { persist } from 'effector-storage/local'; // Not persisting searchParams here, URL is the source of truth
import { githubClient } from '../../../shared/api/github'; // Corrected path
import { 
  GET_USER_REPOSITORIES, 
  SEARCH_REPOSITORIES 
  // GET_REPOSITORY_DETAILS is not used by this feature store
} from '../../../shared/api/queries'; // Corrected path
import type { 
  Repository, 
  SearchParams,
  RepositoriesResponse,
  SearchRepositoriesResponse,
  // RepositoryDetailsResponse, // Not used here
  PageInfo
} from '../../../shared/api/types'; // Corrected path
import type { FetchPolicy } from '@apollo/client';

// This store manages the state and logic for fetching, displaying, 
// searching, and paginating a list of repositories.

const ITEMS_PER_PAGE = 10;

// --- 1. Domain Events ---
export const setSearchParams = createEvent<Partial<SearchParams>>();
export const resetRepositories = createEvent();
// resetCurrentRepository is not part of this feature
export const fetchRepositoriesTrigger = createEvent();
const bridgingPageFetched = createEvent<{ nextPageNumber: number; endCursor: string | null }>();
export const appMounted = createEvent(); // Exporting for main.tsx to call

// --- 2. Stores (Independent) ---
const getInitialSearchParams = (): SearchParams => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('query') || '';
  const page = parseInt(params.get('page') || '1', 10);
  return { query, page: isNaN(page) || page < 1 ? 1 : page, perPage: ITEMS_PER_PAGE };
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
    return newState;
  });

export const $repositories = createStore<Repository[]>([]);
// $currentRepository is not part of this feature
export const $error = createStore<Error | null>(null);
export const $totalCount = createStore(0);
export const $hasNextPage = createStore(false);
export const $endCursor = createStore<string | null>(null);
export const $pageMap = createStore<Record<number, string | null>>({})
  .on(bridgingPageFetched, (state, { nextPageNumber, endCursor }) => ({ ...state, [nextPageNumber]: endCursor }));

// --- 3. Effects ---
type UserReposEffectResult = RepositoriesResponse['viewer']['repositories'];
type SearchReposEffectResult = SearchRepositoriesResponse['search'];

export const fetchUserRepositoriesFx = createEffect(async (params: { perPage: number; endCursor: string | null }): Promise<UserReposEffectResult> => {
  const { data } = await githubClient.query<RepositoriesResponse>({
    query: GET_USER_REPOSITORIES, variables: { first: params.perPage, after: params.endCursor }, fetchPolicy: 'cache-first' as FetchPolicy,
  });
  return data.viewer.repositories;
});

export const searchRepositoriesFx = createEffect(async (params: { query: string; perPage: number; endCursor: string | null }): Promise<SearchReposEffectResult> => {
  const { data } = await githubClient.query<SearchRepositoriesResponse>({
    query: SEARCH_REPOSITORIES, variables: { query: params.query, first: params.perPage, after: params.endCursor }, fetchPolicy: 'cache-first' as FetchPolicy,
  });
  // Ensure the returned object matches SearchReposEffectResult type structure
  return data.search; 
});

// fetchRepositoryDetailsFx is not part of this feature

export const fetchPagesSequentiallyFx = createEffect(
  async ({ targetPage, query, perPage }: { targetPage: number; query?: string; perPage: number }): Promise<{ success: boolean }> => {
    try {
      for (let currentPageToFetch = 1; currentPageToFetch < targetPage; currentPageToFetch++) {
        const pageMapSnapshot = $pageMap.getState();
        const cursorForCurrentPageToFetch = currentPageToFetch === 1 ? null : pageMapSnapshot[currentPageToFetch];
        if (currentPageToFetch > 1 && !cursorForCurrentPageToFetch) {
          throw new Error(`Missing cursor for page ${currentPageToFetch} in sequential fetch. Map: ${JSON.stringify(pageMapSnapshot)}`);
        }
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
      throw error as Error;
    }
  },
);

// --- 4. Dependent Stores & Logic ---
export const $isFetchingBridgingPages = createStore(false)
  .on(fetchPagesSequentiallyFx.pending, (_, pending) => pending);

// const $wasSearchActive = createStore(false) // Removed as it's currently unused
//   .on(searchRepositoriesFx.doneData, () => true)
//   .on(fetchUserRepositoriesFx.doneData, () => false);

export const $loading = createStore(false)
  .on(fetchUserRepositoriesFx.pending, (_, isPending) => isPending || $isFetchingBridgingPages.getState())
  .on(searchRepositoriesFx.pending, (_, isPending) => isPending || $isFetchingBridgingPages.getState())
  .on(fetchPagesSequentiallyFx.pending, (_, isPending) => isPending);
  // Note: fetchRepositoryDetailsFx logic is not in this store, so its pending state is not handled here.

const anyEffectFinally = sample({
  clock: [
    fetchUserRepositoriesFx.finally,
    searchRepositoriesFx.finally,
    fetchPagesSequentiallyFx.finally,
  ]
});

$loading.on(anyEffectFinally, () => 
    fetchUserRepositoriesFx.pending.getState() ||
    searchRepositoriesFx.pending.getState() ||
    fetchPagesSequentiallyFx.pending.getState()
);

// --- 5. Store Updaters from Effects ---
$error
  .on(fetchUserRepositoriesFx.failData, (_, error: Error) => error)
  .on(searchRepositoriesFx.failData, (_, error: Error) => error)
  // fetchRepositoryDetailsFx.failData is not relevant here
  .on(fetchPagesSequentiallyFx.failData, (_, error: Error) => error)
  .reset(fetchUserRepositoriesFx)
  .reset(searchRepositoriesFx)
  .reset(fetchPagesSequentiallyFx);

$repositories
  .on(resetRepositories, () => [])
  .on(fetchUserRepositoriesFx.doneData, (_, userReposPayload) => userReposPayload.nodes)
  .on(searchRepositoriesFx.doneData, (_, searchReposPayload) => searchReposPayload.edges.map((edge: { node: Repository }) => edge.node));

$totalCount
  .on(fetchUserRepositoriesFx.doneData, (_, userReposPayload) => userReposPayload.totalCount)
  .on(searchRepositoriesFx.doneData, (_, searchReposPayload) => searchReposPayload.repositoryCount)
  .reset(resetRepositories);

$hasNextPage
  .on(fetchUserRepositoriesFx.doneData, (_, userReposPayload) => userReposPayload.pageInfo.hasNextPage)
  .on(searchRepositoriesFx.doneData, (_, searchReposPayload) => searchReposPayload.pageInfo.hasNextPage)
  .reset(resetRepositories);

$endCursor
  .on(fetchUserRepositoriesFx.doneData, (_, userReposPayload) => userReposPayload.pageInfo.endCursor)
  .on(searchRepositoriesFx.doneData, (_, searchReposPayload) => searchReposPayload.pageInfo.endCursor)
  .reset(resetRepositories);

$pageMap
  .on(fetchUserRepositoriesFx.doneData, (state, userReposPayload) => ({ 
    ...state, 
    [$searchParams.getState().page + 1]: userReposPayload.pageInfo.endCursor || null 
  }))
  .on(searchRepositoriesFx.doneData, (state, searchReposPayload) => ({ 
    ...state, 
    [$searchParams.getState().page + 1]: searchReposPayload.pageInfo.endCursor || null 
  }))
  .reset(resetRepositories);

// --- 6. Sample Logic / Business logic ---
sample({ clock: setSearchParams, source: $searchParams, filter: (s, p) => p.query !== undefined && p.query !== s.query, target: [resetRepositories, fetchRepositoriesTrigger] });
sample({ clock: setSearchParams, source: $searchParams, filter: (s, p) => p.query !== undefined && p.query !== s.query, fn: (s) => ({ ...s, page: 1 }), target: $searchParams });

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

sample({ clock: fetchRepositoriesLogic, filter: (d: FetchRepositoriesLogicFnResult) => d.hasQuery, fn: (d: FetchRepositoriesLogicFnResult) => ({ query: d.finalParams.query, perPage: d.finalParams.perPage, endCursor: d.endCursor }), target: searchRepositoriesFx });
sample({ clock: fetchRepositoriesLogic, filter: (d: FetchRepositoriesLogicFnResult) => !d.hasQuery, fn: (d: FetchRepositoriesLogicFnResult) => ({ perPage: d.finalParams.perPage, endCursor: d.endCursor }), target: fetchUserRepositoriesFx });

appMounted.watch(() => console.log('[features/repository-list/list.store.ts] appMounted event triggered!'));
const initialLoadCheck = sample({ clock: appMounted, source: { params: $searchParams, map: $pageMap }});

sample({ clock: initialLoadCheck, filter: ({ params, map }) => params.page > 1 && !map[params.page], fn: ({ params }) => ({ targetPage: params.page, query: params.query, perPage: params.perPage }), target: fetchPagesSequentiallyFx });
sample({ clock: initialLoadCheck, filter: ({ params, map }) => params.page === 1 || (params.page > 1 && !!map[params.page]), target: fetchRepositoriesTrigger });
sample({ clock: fetchPagesSequentiallyFx.doneData, target: fetchRepositoriesTrigger });

// Persist removed as URL is the source of truth for searchParams 