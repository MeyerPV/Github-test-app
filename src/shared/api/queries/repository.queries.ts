import { gql } from '@apollo/client';

// Fragment for repository with basic fields
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

// Query to get repositories of the (authenticated) user
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

// Query to get detailed information about a repository
export const GET_REPOSITORY_DETAILS = gql`
  query GetRepositoryDetails($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      ...RepositoryFields
    }
  }
  ${REPOSITORY_FRAGMENT}
`; 