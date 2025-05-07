import React from 'react';
import ReactDOM from 'react-dom/client';
// Путь к App.tsx, вероятно, такой, если App.tsx лежит в src/app/
import { App } from './app/App'; 
// ИСПРАВЛЕННЫЙ ПУТЬ к главному CSS файлу
import './index.css'; 
// Импортируем appMounted из стора
import { appMounted } from './entities/repository/model/store';

const rootElement = document.getElementById('root');
if (rootElement) {
  // Вызываем appMounted() перед рендерингом приложения
  appMounted();

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}