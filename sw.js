const CACHE='bs-ofis-butce-ui253-branding-20260815';
const ASSETS=[
  './?v=253',
  './index.html?v=253',
  './styles.css?v=219',
  './v247-design-system.css?v=247',
  './v2471-mobile-polish.css?v=2471',
  './v248-dashboard-polish.css?v=248',
  './v249-debts-polish.css?v=249',
  './v250-payments-polish.css?v=250',
  './v251-incomes-polish.css?v=251',
  './v252-calendar-polish.css?v=252',
  './v253-branding.css?v=253',
  './app.js?v=176',
  './core-compat.js?v=240',
  './v17-ui.js?v=218',
  './v175-ui.js?v=175',
  './v176-ui.js?v=218',
  './v177-ui.js?v=214',
  './v178-ui.js?v=214',
  './v179-ui.js?v=179',
  './ui.js?v=217',
  './payment-plan.js?v=200',
  './payment-schedule.js?v=222',
  './exact-schedule.js?v=224',
  './debt-balance.js?v=236',
  './schedule-editor.js?v=232',
  './payment-editor-v240.js?v=240',
  './v230-mobile-dialog.js?v=235',
  './v234-shell-lock.js?v=237',
  './v237-modal-footer.js?v=237',
  './v241-payment-modal-scroll-lock.js?v=241',
  './v242-payment-save-ui.js?v=242',
  './v244-monthly-report.js?v=244',
  './v245-report-print-fix.js?v=245',
  './v246-direct-pdf-report.js?v=246',
  './manifest.webmanifest?v=253',
  './bs-budget-app-icon-v253.svg?v=253',
  './bs-budget-logo-v194.svg?v=194',
  './bs-budget-mark-v194.svg?v=195',
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
        keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  )
);

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET' || new URL(e.request.url).origin!==location.origin) return;

  e.respondWith(
    fetch(e.request,{cache:'no-store'})
      .then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return r;
      })
      .catch(()=>caches.match(e.request).then(r=>r||caches.match('./?v=253')||caches.match('./index.html?v=253')))
  );
});