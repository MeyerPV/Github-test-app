import { gql } from '@apollo/client';

// Фрагмент для репозитория с базовыми полями
export const REPOSITORY_FRAGMENT = gql`
  fragment RepositoryFields on Repository {
    id
    name
    url
    stargazerCount
    owner {
      login
      avatarUrl
      url
    }
    defaultBranchRef {
      target {
        ... on Commit {
          committedDate
        }
      }
    }
    description
    languages(first: 10) {
      nodes {
        id
        name
        color
      }
    }
  }
`;

// Запрос для получения репозиториев пользователя (аутентифицированного)
export const GET_USER_REPOSITORIES = gql`
  query GetUserRepositories($first: Int!, $after: String) {
    viewer {
      repositories(first: $first, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...RepositoryFields
        }
      }
    }
  }
  ${REPOSITORY_FRAGMENT}
`;

// Запрос для получения детальной информации о репозитории
export const GET_REPOSITORY_DETAILS = gql`
  query GetRepositoryDetails($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      ...RepositoryFields
    }
  }
  ${REPOSITORY_FRAGMENT}
`; 