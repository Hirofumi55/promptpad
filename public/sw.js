/**
 * PromptPad Service Worker
 * - Appシェル (HTML/CSS/JS) → Cache First（初回はキャッシュ、更新時は Background Sync）
 * - Googleフォント → Stale While Revalidate
 * - localStorage データはブラウザが管理するため SW の対象外
 */

const CACHE_NAME = 'promptpad-v1';

// キャッシュするアセットパターン
const CACHE_PATTERNS = [
  /^\/_astro\//,
  /\/icons\//,
  /\/favicon/,
  /\/manifest\.webmanifest$/,
  /\/sw\.js$/,
];

// インストール: 基本シェルをプリキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/', '/manifest.webmanifest'])
    )
  );
  // 待機をスキップして即座にアクティブ化
  self.skipWaiting();
});

// アクティベート: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// フェッチ: Cache First（アプリアセット）/ Network First（その他）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Googleフォント: Stale While Revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // アプリアセット: Cache First
  if (
    url.origin === self.location.origin &&
    (url.pathname === '/' || CACHE_PATTERNS.some((p) => p.test(url.pathname)))
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // その他: ネットワーク優先（失敗時はキャッシュ）
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
    }
    return response;
  });
  return cached ?? fetchPromise;
}
