import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import type { FetchPolicy } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Инициализируем HTTP линк
const httpLink = createHttpLink({
  uri: 'https://api.github.com/graphql',
});

// Функция получения токена
export const getToken = (): string => {
  console.log('[DEBUG] getToken called');
  const tokenFromStorage = localStorage.getItem('github_token');
  const tokenFromEnv = import.meta.env.VITE_GITHUB_TOKEN;
  console.log('[DEBUG] Token from localStorage:', tokenFromStorage);
  console.log('[DEBUG] Token from env:', tokenFromEnv);
  const token = tokenFromStorage || tokenFromEnv || '';
  console.log('[DEBUG] Final token being used:', token ? 'TOKEN_PRESENT' : 'TOKEN_EMPTY');
  return token;
};

// Auth линк
const authLink = setContext((_, { headers }) => {
  console.log('[DEBUG] authLink setContext called');
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

console.log('[DEBUG] About to create Apollo Client instance');
// Создаем Apollo Client
export const createGithubClient = () => new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only' as FetchPolicy,
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export const githubClient = createGithubClient();
console.log('[DEBUG] Apollo Client instance created:', githubClient);

// For diagnostics: attempt to clear the Apollo Client cache on startup
if (githubClient && typeof githubClient.clearStore === 'function') {
  console.log('[DEBUG] Attempting to clear Apollo Client cache on startup');
  githubClient.clearStore().then(() => {
    console.log('[DEBUG] Apollo Client cache cleared successfully on startup');
  }).catch(err => {
    console.error('[DEBUG] Error clearing Apollo Client cache on startup:', err);
  });
} else if (githubClient) {
  console.warn('[DEBUG] githubClient.clearStore is not a function. Cache not cleared.');
} else {
  console.warn('[DEBUG] githubClient is not available. Cache not cleared.');
} 