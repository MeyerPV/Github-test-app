import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import type { FetchPolicy, FieldFunctionOptions } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Определяем типы для существующих и входящих данных для merge функций
type SearchResult = {
  edges?: { node: unknown }[];
  pageInfo?: { hasNextPage: boolean; endCursor: string };
  repositoryCount?: number;
} | null | undefined;

// Тип для ViewerRepositoriesResult больше не нужен для merge

// Инициализируем HTTP линк для GitHub GraphQL API
const httpLink = createHttpLink({
  uri: 'https://api.github.com/graphql',
});

// Функция для получения токена из localStorage или .env
export const getToken = (): string => {
  // В production приложении token должен храниться безопасно
  // и подгружаться из .env файла или специального хранилища
  return localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || '';
};

// Настраиваем авторизационный хедер
const authLink = setContext((_, { headers }) => {
  const token = getToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Создаем инстанс Apollo Client
export const createGithubClient = () => new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Настраиваем кэширование запросов поиска и репозиториев
          search: {
            keyArgs: ["query", "type"],
            merge(existing: SearchResult, incoming: SearchResult, { args }: FieldFunctionOptions) {
              const existingEdges = existing?.edges ?? [];
              const incomingEdges = incoming?.edges ?? [];
              if (!args || !args?.after) {
                return incoming;
              }
              return {
                ...incoming,
                // Объединяем безопасно
                edges: [...existingEdges, ...incomingEdges],
              };
            },
          },
          // Возвращаем простую merge политику для viewer
          viewer: {
            merge: true,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-and-network' as FetchPolicy,
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Экспортируем инстанс клиента для использования в приложении
export const githubClient = createGithubClient(); 