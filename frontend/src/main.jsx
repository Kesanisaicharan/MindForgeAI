import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Cache only the application shell and static assets. Authenticated API responses
// are never placed in the service-worker cache; learning-plan/answer offline data
// stays in the page's explicit per-user local cache.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline mode still uses the in-page learning cache if registration is unavailable.
    });
  });
}
