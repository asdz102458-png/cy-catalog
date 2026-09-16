const VERSION = 'cy-catalog-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 先連網拿最新版，拿不到才吃快取 —— 這樣型錄更新會自己進來，沒訊號也開得起來
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(r, copy));
        return res;
      })
      .catch(() => caches.match(r).then(hit => hit || caches.match('./index.html')))
  );
});
