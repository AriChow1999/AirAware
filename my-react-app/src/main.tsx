/* eslint-disable react-refresh/only-export-components */
/* main.tsx */
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import './index.css'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import axios from 'axios'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- AXIOS RESPONSE INTERCEPTOR ONLY ---
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the failed request was a login attempt
    const isLoginRequest = error.config?.url?.includes('/api/auth/login');

    // If status is 401 AND it's NOT a login attempt, trigger global logout
    if (error.response?.status === 401 && !isLoginRequest) {
      const { logout } = useAuthStore();
      logout();
    }

    // Pass the error back to the component's .catch() block
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient()
const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        style={{ zIndex: 9999 }}
      />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)