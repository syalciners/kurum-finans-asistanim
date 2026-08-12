const CACHE='bs-butce-yonetimi-v183-20260812';
const ASSETS=[
  './?v=183',
  './index.html?v=180',
  './styles.css?v=176',
  './app.js?v=176',
  './v17-ui.js?v=176',
  './v175-ui.js?v=175',
  './v176-ui.js?v=176',
  './v177-ui.js?v=177',
  './v178-ui.js?v=180',
  './v179-ui.js?v=179',
  './v180-ui.js?v=180',
  './v181-ui.js?v=181',
  './v182-ui.js?v=182',
  './manifest.webmanifest?v=182',
  './bs-budget-mark.svg?v=182',
  './bs-budget-logo.svg?v=180'
];

self.addEventListener('install',e=>
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  )
);

self.addEventListener('activate',e=>
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys
          .filter(k=>k!==CACHE)
          .map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  )
);

self.addEventListener('fetch',e=>{
  if(
    e.request.method!=='GET' ||
    new URL(e.request.url).origin!==location.origin
  ) return;

  e.respondWith(
    fetch(e.request,{cache:'no-store'})
      .then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return r;
      })
      .catch(()=>
        caches.match(e.request)
          .then(r=>r||caches.match('./?v=183')||caches.match('./index.html?v=180'))
      )
  );
});