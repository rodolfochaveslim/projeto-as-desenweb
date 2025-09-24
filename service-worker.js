const CACHE = 'patascep-v1';
const ASSETS = [
  'index.html','animais.html','contato.html','registros.html','offline.html',
  'manifest.webmanifest','favicon.ico','icon.png','icon.svg',
  'assets/css/styles.css',
  'assets/js/index.js','assets/js/animais.js','assets/js/contato.js','assets/js/registros.js','assets/js/storage.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === location.origin;

  // navegação das páginas -> network first + fallback cache + offline.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(async () => (await caches.match(e.request)) || caches.match('offline.html'))
    );
    return;
  }

  // assets locais -> cache first
  if (isSameOrigin) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }))
    );
  }
});
