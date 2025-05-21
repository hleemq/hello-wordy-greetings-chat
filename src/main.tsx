
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a directory to store icons if it doesn't exist
// This will be done at build time by the service worker
const checkIcons = async () => {
  try {
    // We don't actually need to do anything here in the browser
    // Icons will be created and stored in the public/icons directory
    console.log('PWA is ready to use');
  } catch (error) {
    console.error('Error checking icons:', error);
  }
};

// Initialize the app
const init = async () => {
  await checkIcons();
  createRoot(document.getElementById("root")!).render(<App />);
};

init();
