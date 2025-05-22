
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Function to register the service worker
const registerServiceWorker = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/service-worker.js', { 
        scope: '/' 
      });
      
      console.log('SW registered with scope:', registration.scope);
      
      // Check if we need to refresh due to a new service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // At this point, a new service worker is installed, but the previous
              // one is still active. We will prompt the user to reload.
              console.log('New service worker installed, ready to activate');
              
              // Inform the user that a refresh is needed
              if (window.confirm('A new version is available. Load the update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
};

// Initialize the app
const init = async () => {
  // Register service worker for improved loading performance
  await registerServiceWorker();
  
  // Initialize the UI
  createRoot(document.getElementById("root")!).render(<App />);
};

init();
