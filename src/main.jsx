import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from 'react-error-boundary';
import FallbackPage from './Components/FallbackPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={FallbackPage}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
