// V258 Eğitim Supabase gelir senkron build
const CACHE='bs-ofis-butce-v258-egitim-gelir-20260815';
const ASSETS=[
  './?v=258',
  './index.html?v=258',
  './styles.css?v=219',
  './v247-design-system.css?v=247',
  './v2471-mobile-polish.css?v=2574',
  './v248-dashboard-polish.css?v=248',
  './v249-debts-polish.css?v=249',
  './v250-payments-polish.css?v=250',
  './v251-incomes-polish.css?v=251',
  './v252-calendar-polish.css?v=252',
  './v257-foundation.css?v=2574',
  './app.js?v=257',
  './core-compat.js?v=258',
  './v258-education-income-sync.js?v=258',
  './v17-ui.js?v=218',
  './v175-ui.js?v=175',
  './v176-ui.js?v=218',
  './v177-ui.js?v=214',
  './v178-ui.js?v=214',
  './v179-ui.js?v=179',
  './ui.js?v=257',
  './payment-plan.js?v=200',
  './payment-schedule.js?v=222',
  './exact-schedule.js?v=224',
  './debt-balance.js?v=236',
  './schedule-editor.js?v=232',
  './payment-editor-v240.js?v=240',
  './v230-mobile-dialog.js?v=2571',
  './v234-shell-lock.js?v=257',
  './v241-payment-modal-scroll-lock.js?v=241',
  './v242-payment-save-ui.js?v=242',
  './v244-monthly-report.js?v=244',
  './v246-direct-pdf-report.js?v=246',
  './manifest.webmanifest?v=257',
  './bs-budget-app-icon-v256.svg?v=257',
  './bs-budget-header-mark-v256.svg?v=257',
  './bs-budget-horizontal-logo-v256.svg?v=257',
  './bs-budget-horizontal-logo-v256-mono-dark.svg?v=257',
  './bs-budget-horizontal-logo-v256-mono-white.svg?v=257',
  './bs-budget-mark-v194.svg?v=195'
];

self.addEventListener('install',event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate',event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch',event => {
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;

  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request,copy));
        return response;
      })
      .catch(() => caches.match(event.request)
        .then(response => response || caches.match('./?v=258') || caches.match('./index.html?v=258')))
  );
});
