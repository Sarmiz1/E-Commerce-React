import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom"
import App from './App.jsx'
import { ErrorBoundary } from 'react-error-boundary';
import FallbackPage from './Components/FallbackPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={FallbackPage}>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
