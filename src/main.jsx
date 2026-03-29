import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// DIAGNOSTIC 01: Capture top-level boot errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('CRITICAL BOOT ERROR:', { message, source, lineno, colno, error });
};

window.onunhandledrejection = (event) => {
  console.error('UNHANDLED PROMISE REJECTION:', event.reason);
};

console.log('ADMIN APP: Initializing boot sequence...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
