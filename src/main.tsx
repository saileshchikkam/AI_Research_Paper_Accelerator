import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global API Interceptor supporting custom production backend URL switching
const originalFetch = window.fetch;
const customFetch = function (input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const apiBase = (import.meta as any).env.VITE_API_URL || '';
    return originalFetch(apiBase + input, init);
  }
  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    configurable: true,
    enumerable: true,
    writable: true
  });
} catch (err) {
  console.warn("Object.defineProperty on window.fetch failed, attempting direct assignment:", err);
  try {
    window.fetch = customFetch;
  } catch (assignErr) {
    console.error("Failed to intercept window.fetch completely:", assignErr);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

