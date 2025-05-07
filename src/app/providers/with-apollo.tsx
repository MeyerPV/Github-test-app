import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { createGithubClient } from '../../shared/api/github';

interface WithApolloProps {
  children: ReactNode;
}

export const WithApollo = ({ children }: WithApolloProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');

  useEffect(() => {
    // Проверяем, есть ли токен в localStorage или в .env
    const savedToken = localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN;
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Создаем новый клиент при изменении токена
  const client = useMemo(() => {
    return createGithubClient();
  }, []);

  const handleSaveToken = () => {
    if (tokenInput) {
      localStorage.setItem('github_token', tokenInput);
      setToken(tokenInput);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">GitHub Token</h1>
          <p className="mb-4 text-slate-600">
            Для работы с GitHub API необходим персональный токен доступа. 
            Пожалуйста, предоставьте ваш токен ниже.
          </p>
          <div className="space-y-4">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Введите ваш GitHub токен"
              className="input w-full"
            />
            <button
              onClick={handleSaveToken}
              className="btn btn-primary w-full"
            >
              Сохранить токен
            </button>
            <p className="text-xs text-slate-500 mt-2">
              Токен будет сохранен только в localStorage вашего браузера.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}; 