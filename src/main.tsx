import React from 'react';
import ReactDOM from 'react-dom/client';
// Путь к App.tsx, вероятно, такой, если App.tsx лежит в src/app/
import { App } from './app/App'; 
// ИСПРАВЛЕННЫЙ ПУТЬ к главному CSS файлу
import './index.css'; 

// --- НАЧАЛО МИНИМАЛЬНОГО ТЕСТА ---
// Убедитесь, что эти пути к вашим файлам API корректны
import { githubClient } from './shared/api/github'; 
import { GET_USER_REPOSITORIES } from './shared/api/queries'; 

console.log('--- [MINIMAL TEST] main.tsx: Script Start ---');

if (!githubClient) {
  console.error('[MINIMAL TEST] main.tsx: githubClient is undefined or null!');
} else {
  console.log('[MINIMAL TEST] main.tsx: githubClient seems to be available:', githubClient);
  
  if (!GET_USER_REPOSITORIES) {
    console.error('[MINIMAL TEST] main.tsx: GET_USER_REPOSITORIES is undefined or null!');
  } else {
    console.log('[MINIMAL TEST] main.tsx: GET_USER_REPOSITORIES seems to be available:', GET_USER_REPOSITORIES);

    console.log('[MINIMAL TEST] main.tsx: Attempting direct Apollo query...');
    githubClient.query({
      query: GET_USER_REPOSITORIES,
      variables: { first: 1, after: null },
      fetchPolicy: 'network-only'
    })
    .then(result => {
      console.log('[MINIMAL TEST] main.tsx: Direct Apollo query success:', result);
      if (result.data) {
        console.log('[MINIMAL TEST] main.tsx: Data:', result.data);
      }
      if (result.errors) {
        console.error('[MINIMAL TEST] main.tsx: GraphQL Errors in success response:', result.errors);
      }
    })
    .catch(error => {
      console.error('[MINIMAL TEST] main.tsx: Direct Apollo query error:', error);
      if (error.graphQLErrors) {
        console.error('[MINIMAL TEST] main.tsx: GraphQL Errors in catch:', error.graphQLErrors);
      }
      if (error.networkError) {
        console.error('[MINIMAL TEST] main.tsx: Network Error in catch:', error.networkError);
      }
    });
  }
}
console.log('--- [MINIMAL TEST] main.tsx: Script End, proceeding to render App ---');
// --- КОНЕЦ МИНИМАЛЬНОГО ТЕСТА ---

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}