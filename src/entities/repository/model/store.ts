import { createStore, createEvent, createEffect, sample } from 'effector';
// import { persist } from 'effector-storage/local'; // Commented out if not used elsewhere for other stores
import { githubClient } from '../../../shared/api/github';
import { GET_REPOSITORY_DETAILS } from '../../../shared/api/queries'; // Only import details query
import type { Repository, RepositoryDetailsResponse } from '../../../shared/api/types';
import type { FetchPolicy } from '@apollo/client';

// --- Events related to the current repository detail view ---
export const resetCurrentRepository = createEvent();
// Event to trigger loading details (can be called from the page component)
export const loadRepositoryDetails = createEvent<{ owner: string; name: string }>();

// --- Effect for fetching details ---
export const fetchRepositoryDetailsFx = createEffect(async (params: { owner: string; name: string }): Promise<Repository> => {
  const { data } = await githubClient.query<RepositoryDetailsResponse>({
    query: GET_REPOSITORY_DETAILS, 
    variables: { owner: params.owner, name: params.name }, 
    fetchPolicy: 'cache-first' as FetchPolicy, 
  });
  return data.repository;
});

// --- Store for the currently viewed repository ---
export const $currentRepository = createStore<Repository | null>(null)
  .on(fetchRepositoryDetailsFx.doneData, (_, repo) => repo) // Corrected: directly use the returned repo
  .reset(resetCurrentRepository); 

// --- Stores for loading/error state specific to details ---
export const $currentRepositoryLoading = createStore(false)
  .on(fetchRepositoryDetailsFx.pending, (_, pending) => pending)
  .on(fetchRepositoryDetailsFx.finally, () => false); // Ensure loading is reset

export const $currentRepositoryError = createStore<Error | null>(null)
  .on(fetchRepositoryDetailsFx.failData, (_, error: Error) => error)
  .reset(fetchRepositoryDetailsFx) // Reset error when effect runs again or is reset
  .reset(resetCurrentRepository); // Also reset error when repository is reset

// --- Logic to trigger loading details ---
sample({
  clock: loadRepositoryDetails,
  target: fetchRepositoryDetailsFx
}); 