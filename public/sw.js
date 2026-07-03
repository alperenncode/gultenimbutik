/**
 * Basit service worker — PWA yüklenebilirliği için.
 * Strateji: ağ öncelikli (site her zaman güncel kalır); statik ikon/font gibi
 * dosyalar önbelleğe alınır, çevrimdışıyken önbellekten sunulur.
 */
const CACHE = "gultenim-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(["/icons/icon-192.png"]))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Yalnızca kendi alan adımızdaki statik varlıkları önbellekle
  const isStatic =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/icons/") || url.pathname.startsWith("/_next/static/"));

  if (isStatic) {
    // Önbellek öncelikli — statikler değişmez (hash'li)
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          })
      )
    );
  } else {
    // Ağ öncelikli — çevrimdışıysa önbellekteki son kopyaya düş
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((c) => c ?? Response.error()))
    );
  }
});
