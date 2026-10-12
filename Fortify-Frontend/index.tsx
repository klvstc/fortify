import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Register Service Worker for offline capabilities and push notifications.
// Firebase Messaging, by default, looks for a file named 'firebase-messaging-sw.js'.
// By using this filename, we simplify the registration process and make it more robust.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./firebase-messaging-sw.js')
      .catch(() => {
        // ServiceWorker registration failed.
      });
  });
}