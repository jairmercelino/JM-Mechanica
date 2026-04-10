const CACHE = 'jm-v2';
const ASSETS = [
  './dashboard.html',
  './index.html',
  './diensten.html',
  './over-mij.html',
  './chatbot.js',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-wit.svg',
  './jm_mechanica_logo_wit.svg',
  './manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  // Verwijder oude caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// Network-first strategie: probeer netwerk, val terug op cache
self.addEventListener('fetch', e => {
  // Alleen GET requests cachen
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Sla succesvolle responses op in cache
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notificaties (werkt wanneer app op achtergrond is)
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

// Tik op notificatie → open dashboard
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const actie = e.notification.data && e.notification.data.actie;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('dashboard.html') && 'focus' in client) {
          if (actie) client.postMessage({ type: 'inklok-actie', actie });
          return client.focus();
        }
      }
      return clients.openWindow('./dashboard.html');
    })
  );
});
