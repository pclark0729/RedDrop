import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App'
// import TestApp from './TestApp'

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add error handling for React rendering
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Failed to find the root element');
  document.body.innerHTML = 'Failed to find the root element. Make sure there is a <div id="root"></div> in your HTML.';
} else {
  try {
    console.log('Initializing React application...');
    const root = createRoot(rootElement);
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log('React app successfully mounted');
  } catch (error) {
    console.error('Failed to render React app:', error);
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px; font-family: sans-serif;">
        <h1>Failed to render React app</h1>
        <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
        <p>Please check the console for more details.</p>
      </div>
    `;
  }
}
