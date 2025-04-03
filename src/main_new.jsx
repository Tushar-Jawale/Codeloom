import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConvexProvider } from 'convex/react'
import { getConvexClient } from './services/convexService'

const convexClient = getConvexClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConvexProvider client={convexClient}>
      <App />
    </ConvexProvider>
  </StrictMode>,
) 