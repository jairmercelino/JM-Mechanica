const CACHE = 'jm-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./dashboard.html', './icon.svg', './manifest.json']))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Push notifications from service worker (works when app is backgrounded)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'JM Mechanica', body: '' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon.svg',
      badge: './icon.svg',
      tag: data.tag || 'jm-melding',
      requireInteraction: true,
      data: data
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('dashboard.html') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('./dashboard.html');
    })
  );
});
