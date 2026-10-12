// Import Firebase scripts for push notifications
self.importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
self.importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAYF0WqelG8aW-N75YuUFLe9zIMholc03U",
  authDomain: "fortify-final.firebaseapp.com",
  projectId: "fortify-final",
  storageBucket: "fortify-final.firebasestorage.app",
  messagingSenderId: "1060219683777",
  appId: "1:1060219683777:web:79c6ab42327917646c2540",
};

// Initialize Firebase for service worker
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  let notificationTitle;
  let notificationOptions;

  // Handle the specific test notification payload from the docs
  if (payload.data && payload.data.score) {
    notificationTitle = 'Test Notification Received!';
    notificationOptions = {
      body: `Score: ${payload.data.score}, Time: ${payload.data.time}. Data payload is working correctly.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: {
          url: '/'
      }
    };
  } else {
    // Original logic for production notifications
    notificationTitle = payload.notification?.title || payload.data?.title || 'Fortify';
    notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'You have a new message.',
      icon: payload.notification?.icon || payload.data?.icon || '/icons/icon-192x192.png',
      badge: payload.data?.badge || '/icons/icon-192x192.png',
      data: {
          url: payload.data?.url || '/'
      }
    };
  }

  // The service worker must return a promise that resolves when the notification is shown.
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events for a better user experience
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // If a window with the same URL is already open, focus it.
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Listen for postMessage from the TWA host for billing updates.
self.addEventListener('message', (event) => {
  // The native host sends a stringified JSON.
  if (typeof event.data === 'string') {
    try {
      const data = JSON.parse(event.data);
      // Check for a 'status' key as per the guide's payload structure.
      if (data && data.status && ['success', 'canceled', 'failed', 'not_found'].includes(data.status)) {
        // This looks like our purchase update. Forward it to all window clients.
        self.clients.matchAll({
          includeUncontrolled: true,
          type: 'window',
        }).then(clients => {
          if (clients && clients.length) {
            clients.forEach(client => {
              client.postMessage({
                type: 'PURCHASE_UPDATE_FROM_NATIVE',
                data: data,
              });
            });
          }
        });
      }
    } catch (e) {
      // Not a JSON message we care about, ignore.
    }
  }
});

// Caching logic
const CACHE_NAME = 'fortify-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdn.tailwindcss.com'
];

// Install service worker and cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore API calls and non-GET requests
  if (request.method !== 'GET' || url.hostname.includes('googleapis.com')) {
    return;
  }
  
  // Stale-While-Revalidate for same-origin assets (app shell, JS, etc.)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        const fetchPromise = fetch(request).then((networkResponse) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Cache-First for cross-origin static assets (CDNs)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        // Only cache successful responses for third-party assets
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
        }
        return networkResponse;
      });
    })
  );
});