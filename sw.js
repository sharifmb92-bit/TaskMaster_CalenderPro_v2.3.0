// medbasha
// Cambiamos el nombre de la caché para forzar al móvil a descargar el nuevo index.html (v2.4.0)
const CACHE_NAME = 'taskmaster-v2.4.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Instalación: guardar los archivos esenciales en la memoria del móvil
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activación: borra las versiones antiguas de la app (ej. v2.3.0) para que no haya conflictos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de red: Primero busca en caché (para funcionar sin internet), si no, usa la red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Devuelve la versión guardada offline
      }
      return fetch(event.request).catch(() => {
        // Si falla la red, devuelve siempre la app principal
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Cuando el usuario toca la notificación emergente, abre la app automáticamente
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Cierra el aviso en la barra superior
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la app ya está abierta en segundo plano, la trae al frente
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      // Si estaba cerrada del todo, la abre de nuevo
      return clients.openWindow('./');
    })
  );
});
