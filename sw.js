const CACHE = 'jm-v3';
const STATIC_ASSETS = [
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
    caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // HTML pagina's: network-first (altijd nieuwste versie)
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Afbeeldingen & icons: cache-first (veranderen zelden)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // JS & overige: stale-while-revalidate
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetched = fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
    return;
  }

  // Externe resources (CDN, fonts): network met cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notificaties
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

// Notificatie klik → open dashboard
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
