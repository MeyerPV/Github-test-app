import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import type { FetchPolicy } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Инициализируем HTTP линк
const httpLink = createHttpLink({
  uri: 'https://api.github.com/graphql',
});

// Функция получения токена
export const getToken = (): string => {
  return localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || '';
};

// Auth линк
const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

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
      fetchPolicy: 'cache-first' as FetchPolicy,
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export const githubClient = createGithubClient(); 