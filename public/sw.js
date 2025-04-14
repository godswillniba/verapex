const CACHE_NAME = 'verapex-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/moneyBag.png',
  '/moneyBag1.png',
  '/refer-people-image.png',
  '/withdrawal-image.png',
  '/mainBanner.png',
  '/rolled-money.png',
  '/star.png',
  '/src/index.tsx',
  '/src/App.tsx',
  '/src/App.css'
];

self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        ).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

self.addEventListener('push', function(event) {
  console.log('Push notification received', event);

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      title: 'New Notification',
      body: event.data ? event.data.text() : 'No message content',
      icon: '/favicon/web-app-manifest-192x192.png',
      badge: '/favicon/web-app-manifest-192x192.png'
    };
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/favicon/web-app-manifest-192x192.png',
    badge: payload.badge || '/favicon/web-app-manifest-192x192.png',
    image: payload.image, // Add support for large image
    data: {
      url: payload.url || '/',
      timestamp: payload.timestamp || Date.now()
    },
    tag: 'notification-' + Date.now(),
    vibrate: [100, 50, 100],
    requireInteraction: true,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  console.log('Opening URL:', urlToOpen);

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(clientList) {
      for (let client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Push subscription changed', event);
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
    .then(function(subscription) {
      return fetch('save-subscription.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
    })
  );
});