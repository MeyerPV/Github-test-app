import { gql } from '@apollo/client';
import { REPOSITORY_FRAGMENT } from './repository.queries'; // Import fragment from repository queries

// Запрос для поиска репозиториев по имени
export const SEARCH_REPOSITORIES = gql`
  query SearchRepositories($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: REPOSITORY, first: $first, after: $after) {
      repositoryCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ... on Repository {
            ...RepositoryFields
          }
        }
      }
    }
  }
  ${REPOSITORY_FRAGMENT}
`; 