import { createStore, createEvent, createEffect, sample } from 'effector';
import { persist } from 'effector-storage/local'; // For persisting input field, if desired
import { 
    getToken as getCurrentToken, 
    saveTokenToLocalStorage, 
    clearTokenFromLocalStorage 
} from '../../../shared/api/github';

// --- Events ---
export const tokenInputChanged = createEvent<string>();
export const saveTokenClicked = createEvent();
export const useExistingTokenClicked = createEvent(); // To signify using token from .env or already in localStorage
export const clearSavedTokenClicked = createEvent(); // To clear token from localStorage
export const appMounted = createEvent(); // To check initial token status
export const toggleTokenManagerExpansion = createEvent(); // New event

// --- Effects ---
export const saveTokenFx = createEffect((token: string) => {
  saveTokenToLocalStorage(token);
  // Potentially trigger a re-fetch of data or app reload here if needed
  // For now, just saving. App might need a reload to pick up new token for Apollo.
  return token; // Return the saved token
});

export const clearTokenFx = createEffect(() => {
  clearTokenFromLocalStorage();
  // Similar to save, app might need a reload.
});

// --- Stores ---
export const $tokenInput = createStore<string>('')
  .on(tokenInputChanged, (_, value) => value)
  .reset(saveTokenFx.done); // Clear input after successful save

// Stores the token currently being used by the app (from localStorage or .env)
export const $currentToken = createStore<string>(getCurrentToken());

// Stores a message about the token status
export const $tokenStatusMessage = createStore<string>('');

export const $isTokenManagerExpanded = createStore<boolean>(false) // New store, initially collapsed
  .on(toggleTokenManagerExpansion, (isExpanded) => !isExpanded);

// --- Logic ---
sample({
  clock: saveTokenClicked,
  source: $tokenInput,
  filter: (token) => token.trim().length > 0, // Only save if token is not empty
  target: saveTokenFx,
});

// Update $currentToken after saving
sample({
  clock: saveTokenFx.doneData,
  fn: (savedToken) => savedToken, 
  target: $currentToken,
});

// Update $tokenStatusMessage after saving
sample({
  clock: saveTokenFx.doneData,
  fn: () => 'New token saved to localStorage. Reload the page for changes to take effect.',
  target: $tokenStatusMessage,
});

// Update $currentToken after clearing
sample({
  clock: clearTokenFx.done,
  fn: () => getCurrentToken(), 
  target: $currentToken,
});

// Update $tokenStatusMessage after clearing
sample({
  clock: clearTokenFx.done,
  fn: () => 'Saved token cleared. Using default/env token if available. Reload the page.',
  target: $tokenStatusMessage,
});

sample({
    clock: clearSavedTokenClicked,
    target: clearTokenFx
});

// On app mount or when deciding to use existing, update status based on current token
sample({
  clock: [appMounted, useExistingTokenClicked, $currentToken.updates], // Listen to updates of $currentToken too
  fn: () => { // Parameter removed as it was unused and we check directly
    if (localStorage.getItem('github_token')) {
      return 'Using token from localStorage.';
    } else if (import.meta.env.VITE_GITHUB_TOKEN) {
      return 'Using token from .env (default).';
    } else {
      return 'No GitHub token configured. Please enter one.';
    }
  },
  target: $tokenStatusMessage,
});

// Automatically expand if no token is configured on mount
sample({
  clock: appMounted,
  source: $currentToken,
  filter: (currentToken) => !currentToken, // Expand if no token
  fn: () => true, // set expanded to true
  target: $isTokenManagerExpanded,
});

// When a new token is saved, or existing is explicitly chosen, or cleared, collapse the manager
sample({
  clock: [saveTokenFx.done, useExistingTokenClicked, clearTokenFx.done],
  fn: () => false, // set expanded to false
  target: $isTokenManagerExpanded,
});

// Persist $currentToken to reflect changes immediately without needing explicit saveTokenFx for display purposes
// This is more for reflecting the current state than for driving the authLink directly for already running app.
persist({ store: $currentToken, key: 'github-app-current-token-display' }); // Separate key for display 