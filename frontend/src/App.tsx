import './App.css';

import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import APP_ROUTES from './route';
import { applyTheme } from './themes/utils';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
  });
  const router = createBrowserRouter(APP_ROUTES);

  useEffect(() => {
    applyTheme('base');
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  );
}

export default App;
