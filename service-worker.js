/**
 * LG Branch Finder - Service Worker
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'lg-finder-v1.3.0';
const STATIC_CACHE = 'lg-finder-static-v1.3';
const DYNAMIC_CACHE = 'lg-finder-dynamic-v1.3';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/style.min.css',
    '/script.min.js',
    '/lg_branches_with_coords.json',
    '/lg_branches_en.json',
    '/translations/ar.json',
    '/translations/en.json',
    '/logo-lg.svg',
    '/manifest.json',
    '/icons/icon.svg',
    '/smart-stand-logo-new.webp'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('[SW] Cache failed:', err))
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys
                        .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                        .map(key => {
                            console.log('[SW] Removing old cache:', key);
                            return caches.delete(key);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests (like Google Analytics)
    if (url.origin !== location.origin) {
        // For Nominatim API, try network first, then fail gracefully
        if (url.hostname === 'nominatim.openstreetmap.org') {
            event.respondWith(
                fetch(request)
                    .catch(() => new Response(JSON.stringify({ error: 'Offline' }), {
                        headers: { 'Content-Type': 'application/json' }
                    }))
            );
            return;
        }
        return;
    }

    // Cache-first strategy for static files
    if (STATIC_FILES.some(file => url.pathname.endsWith(file) || url.pathname === file)) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        // Update cache in background
                        fetch(request).then(networkResponse => {
                            caches.open(STATIC_CACHE).then(cache => {
                                cache.put(request, networkResponse);
                            });
                        });
                        return response;
                    }
                    return fetch(request).then(networkResponse => {
                        const clonedResponse = networkResponse.clone();
                        caches.open(STATIC_CACHE).then(cache => {
                            cache.put(request, clonedResponse);
                        });
                        return networkResponse;
                    });
                })
        );
        return;
    }

    // Network-first for other requests
    event.respondWith(
        fetch(request)
            .then(response => {
                const clonedResponse = response.clone();
                caches.open(DYNAMIC_CACHE).then(cache => {
                    cache.put(request, clonedResponse);
                });
                return response;
            })
            .catch(() => caches.match(request))
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icons/icon.svg',
            badge: '/icons/icon.svg',
            dir: 'rtl',
            lang: 'ar'
        });
    }
});
