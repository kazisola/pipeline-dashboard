
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import keycloak from './keycloak';
import App from './App';
import './index.css';

// Create a QueryClient with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      // Within 30s, React Query returns cached data without refetching
      // After 30s, it refetches in the background on next use
    },
  },
});

keycloak
  .init({
    onLoad: 'login-required',

    checkLoginIframe: false, // Disable the hidden iframe that checks session status
  })
  .then((authenticated) => {
    if (!authenticated) {
      // shouldn't happen with login-required, but just in case
      window.location.reload();
      return;
    }

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </StrictMode>
    );
  })
  .catch((err) => {
    console.error('Keycloak init failed:', err);
    // If still some time left until the call, will show a proper error page maybe
  });