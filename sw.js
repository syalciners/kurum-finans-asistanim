const CACHE='bs-ofis-butce-ui197-20260812';
const ASSETS=[
  './?v=197',
  './index.html?v=195',
  './styles.css?v=176',
  './app.js?v=176',
  './v17-ui.js?v=176',
  './v175-ui.js?v=175',
  './v176-ui.js?v=190',
  './v177-ui.js?v=177',
  './v178-ui.js?v=178',
  './v179-ui.js?v=179',
  './ui.js?v=191',
  './payment-plan.js?v=196',
  './payment-schedule.js?v=197',
  './manifest.webmanifest?v=195',
  './bs-budget-mark-v194.svg?v=195',
  './bs-budget-logo-v194.svg',
  './bs-budget-mark.svg?v=194',
  './bs-budget-logo.svg?v=194'
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
          .then(r=>r||caches.match('./?v=197')||caches.match('./index.html?v=195'))
      )
  );
});