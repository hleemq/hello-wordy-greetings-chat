
// Cache name with version
const CACHE_NAME = 'we-finance-cache-v2';
const DATA_CACHE_NAME = 'we-finance-data-cache-v1';

// List of files to pre-cache (static assets)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-72x72.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ROUTES = [
  '/expenses',
  '/goals', 
  '/balances'
];

// Install event - precaching static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  
  // Take control of all clients immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete outdated caches
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('Service Worker: removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Helper function to determine if a request is for an API endpoint
const isApiRequest = (url) => {
  return API_ROUTES.some(route => url.pathname.includes(route));
};

// Fetch event - respond with cached resources or network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests with network-first strategy
  if (isApiRequest(url)) {
    event.respondWith(
      fetchAndCache(event.request)
    );
    return;
  }
  
  // For navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // For all other requests - cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response
        if (response) {
          return response;
        }
        
        // Cache miss - get from network
        return fetch(event.request)
          .then((fetchResponse) => {
            // Check if we received a valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            
            // Clone the response
            const responseToCache = fetchResponse.clone();
            
            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return fetchResponse;
          })
          .catch(() => {
            // If it's an image, return a placeholder
            if (event.request.destination === 'image') {
              return caches.match('/placeholder.svg');
            }
          });
      })
  );
});

// Network-first strategy for API endpoints with caching
function fetchAndCache(request) {
  return fetch(request)
    .then(response => {
      // If we got a valid response, clone and cache it
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(DATA_CACHE_NAME)
          .then(cache => {
            cache.put(request, responseToCache);
          });
      }
      return response;
    })
    .catch(() => {
      // If network fails, try to get from cache
      return caches.match(request);
    });
}

// Background sync for offline data resilience
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

// Handle pending operations when back online
async function syncPendingOperations() {
  try {
    // This will be implemented with IndexedDB operations in the app
    console.log('Syncing pending operations');
    
    // Notify all clients that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE'
      });
    });
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
