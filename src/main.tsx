import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App'
// import TestApp from './TestApp'

// Add error handling
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Failed to find the root element')
  document.body.innerHTML = 'Failed to find the root element'
} else {
  try {
    const root = createRoot(rootElement)
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
    
    console.log('React app successfully mounted')
  } catch (error) {
    console.error('Failed to render React app:', error)
    rootElement.innerHTML = '<div style="color: red; padding: 20px;">Failed to render React app</div>'
  }
}
