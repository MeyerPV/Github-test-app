import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { HomePage } from '../../pages/home/ui/HomePage';
import { RepositoryPage } from '../../pages/repository/ui/RepositoryPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/repository/:owner/:name',
    element: <RepositoryPage />
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export const RouterConfig = () => {
  return <RouterProvider router={router} />;
}; 