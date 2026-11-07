// 機内用の入れ物: このページの部品（index.html・manifest.json・sw.js）だけを手元に置き、ネットより手元を先に使う。語（問題）はここに無い（IndexedDB に入る）
const C = 'kinai-kanji-v2';
const PRE = ['./', './index.html', './manifest.json', './sw.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(PRE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('kinai-kanji-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(C).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; });
    if (hit) { net.catch(() => {}); return hit; }
    return net.catch(() => e.request.mode === 'navigate' ? c.match('./index.html') : Response.error());
  })));
});
