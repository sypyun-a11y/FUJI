const CACHE = 'fuji-trek-v1';
const ASSETS = [
  './',
  './fuji-trek.html',
  './og-image.png'
];

// 설치 시 앱 파일 전부 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 이전 버전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 요청 처리: 캐시 우선 → 없으면 네트워크
self.addEventListener('fetch', e => {
  // 날씨 API는 네트워크 우선 (앱 자체에서 localStorage 캐싱 처리)
  if (e.request.url.includes('open-meteo.com')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // 나머지는 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
