import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import type { FetchPolicy } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Initialize HTTP link
const httpLink = createHttpLink({
  uri: 'https://api.github.com/graphql',
});

// Function to get token
export const getToken = (): string => {
  const tokenFromStorage = localStorage.getItem('github_token');
  const tokenFromEnv = import.meta.env.VITE_GITHUB_TOKEN;
  const token = tokenFromStorage || tokenFromEnv || '';
  return token;
};

// Function to save token to localStorage
export const saveTokenToLocalStorage = (token: string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('github_token', token);
    console.log('Token saved to localStorage');
  } else {
    console.warn('localStorage is not available. Token not saved.');
  }
};

// Function to clear token from localStorage
export const clearTokenFromLocalStorage = (): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('github_token');
    console.log('Token cleared from localStorage');
  } else {
    console.warn('localStorage is not available. Token not cleared.');
  }
};

// Auth link
const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create Apollo Client
export const createGithubClient = () => new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first' as FetchPolicy,
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export const githubClient = createGithubClient();
// console.log('[DEBUG] Apollo Client instance created:', githubClient);

// For diagnostics: attempt to clear the Apollo Client cache on startup
// if (githubClient && typeof githubClient.clearStore === 'function') {
//   console.log('[DEBUG] Attempting to clear Apollo Client cache on startup');
//   githubClient.clearStore().then(() => {
//     console.log('[DEBUG] Apollo Client cache cleared successfully on startup');
//   }).catch(err => {
//     console.error('[DEBUG] Error clearing Apollo Client cache on startup:', err);
//   });
// } else if (githubClient) {
//   console.warn('[DEBUG] githubClient.clearStore is not a function. Cache not cleared.');
// } else {
//   console.warn('[DEBUG] githubClient is not available. Cache not cleared.');
// } 