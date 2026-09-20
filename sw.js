const CACHE = 'our-basket-phone-v8';
const ROOT = self.registration.scope;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll([ROOT, new URL('manifest.webmanifest', ROOT), new URL('icon.svg', ROOT)]);
    const html = await (await cache.match(ROOT)).text();
    const assets = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)].map(match => new URL(match[1], ROOT));
    await cache.addAll(assets);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('our-basket-phone-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.open(CACHE)).match(ROOT) || Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then(hit => hit || fetch(request)));
});
