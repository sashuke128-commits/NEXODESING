// sw.js - VERSIÓN LIMPIEZA DEFINITIVA
// Asegúrate de cambiar la versión (v6, v7, etc.) cada vez que cambies el contenido de urlsToCache.
const CACHE_NAME = 'tienda-pwa-v5'; 
const urlsToCache = [
  './',
  './index.html',
  './tienda.html', 
  './admin.html', // Asumiendo que usas 'admin.html' y no 'administrador.html'
  './manifest.webmanifest',
  // ⭐️ ADICIONES CRÍTICAS (ICONOS)
  './icons/icon-192.png', 
  './icons/icon-512.png',
  // ⭐️ ADICIÓN RECOMENDADA (PÁGINA OFFLINE)
  './offline.html' // Necesitas crear esta página para un mejor manejo de errores
];

self.addEventListener('install', event => {
// ... (código 'install' sin cambios, para cachear los archivos de urlsToCache)
// ...
});

self.addEventListener('activate', event => {
// ... (código 'activate' sin cambios, para limpiar cachés viejos)
// ...
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Estrategia: Network-First (y cachéalo para la próxima)
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              caches.open(CACHE_NAME)
                .then(cache => {
                  // Solo cachea si la URL no es de un recurso que cambia con frecuencia (ej: API)
                  // Si no quieres cachear peticiones a la API, puedes añadir una comprobación aquí:
                  // if (!url.pathname.includes('/api/')) { cache.put(event.request, responseToCache); }
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(error => {
            // ⭐️ MEJORA: Respuesta de fallback si falla la red
            console.log('Fetch failed, sirviendo fallback de caché:', error);
            
            // Si la petición es de navegación (p.ej. index.html) sirve la página offline.html
            if (event.request.mode === 'navigate') {
              return caches.match('./offline.html');
            }
            
            // Para otros recursos (imágenes, CSS, etc.), puedes servir la respuesta genérica "Sin conexión"
            // o un fallback más específico (ej: una imagen de placeholder).
            return new Response('Sin conexión', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});