/* BS OFİS BÜTÇE V2.4.6 - Merkezi çekirdek uyumluluk katmanı */
(() => {
  if(window.__bsCoreCompatLoaded) return;
  window.__bsCoreCompatLoaded = true;

  const LEGACY_APP_NAME = 'Borç ve Gelir Asistanım';
  const CURRENT_APP_NAME = 'BS Ofis Bütçe';
  const SCHEMA_VERSION = 16;

  function migrateConfig(){
    let changed = false;

    if(typeof defaultAppConfig === 'object' && defaultAppConfig){
      defaultAppConfig.schemaVersion = SCHEMA_VERSION;
      if(!defaultAppConfig.applicationName || defaultAppConfig.applicationName === LEGACY_APP_NAME){
        defaultAppConfig.applicationName = CURRENT_APP_NAME;
      }
    }

    if(typeof mergeAppConfig === 'function' && !mergeAppConfig.__bsCoreCompatWrapped){
      const originalMergeAppConfig = mergeAppConfig;
      const wrapped = function(raw={}){
        const cfg = originalMergeAppConfig(raw);
        cfg.schemaVersion = SCHEMA_VERSION;
        if(!cfg.applicationName || cfg.applicationName === LEGACY_APP_NAME){
          cfg.applicationName = CURRENT_APP_NAME;
        }
        return cfg;
      };
      wrapped.__bsCoreCompatWrapped = true;
      mergeAppConfig = wrapped;
    }

    if(typeof appConfig === 'object' && appConfig){
      if(appConfig.schemaVersion !== SCHEMA_VERSION){
        appConfig.schemaVersion = SCHEMA_VERSION;
        changed = true;
      }
      if(!appConfig.applicationName || appConfig.applicationName === LEGACY_APP_NAME){
        appConfig.applicationName = CURRENT_APP_NAME;
        changed = true;
      }
    }

    if(changed && typeof saveAppConfig === 'function'){
      saveAppConfig(false);
    }
  }

  function installViewStateGuard(){
    if(typeof renderBottomNav === 'function' && !renderBottomNav.__bsPreserveActiveView){
      const originalRenderBottomNav = renderBottomNav;
      const wrapped = function(){
        const before = activeView;
        const target = document.getElementById(before);
        const validBefore = !!target?.classList?.contains('view');

        originalRenderBottomNav();

        if(validBefore && before && activeView !== before){
          activeView = before;
          document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === before);
          });
          document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === before);
          });
          document.querySelector('#settingsShortcut')?.classList.toggle('active', before === 'settings');
        }
      };
      wrapped.__bsPreserveActiveView = true;
      renderBottomNav = wrapped;
    }

    if(typeof openView === 'function' && !openView.__bsAllowHiddenView){
      const originalOpenView = openView;
      const wrapped = function(view){
        const target = document.getElementById(view);
        const item = typeof menuItem === 'function' ? menuItem(view) : null;
        const hiddenValidView = !!(
          target?.classList?.contains('view') &&
          item &&
          !item.visible &&
          !item.locked
        );

        if(!hiddenValidView){
          return originalOpenView(view);
        }

        activeView = view;
        document.querySelectorAll('.view').forEach(v => {
          v.classList.toggle('active', v.id === view);
        });
        renderBottomNav();
        window.scrollTo({top:0, behavior:'smooth'});
      };
      wrapped.__bsAllowHiddenView = true;
      openView = wrapped;
    }
  }

  function installSafeTitleRenderer(){
    if(typeof renderTitles !== 'function' || renderTitles.__bsUiWrapped) return;

    const originalRenderTitles = renderTitles;
    const requiredIds = [
      'appTitle','orgEyebrow','debtsPageTitle','incomesPageTitle',
      'expensesPageTitle','calendarPageTitle','paymentsPageTitle','settingsPageTitle'
    ];

    function fallback(){
      document.title = CURRENT_APP_NAME;

      const appTitle = document.getElementById('appTitle');
      if(appTitle) appTitle.textContent = CURRENT_APP_NAME;

      const eyebrow = document.getElementById('orgEyebrow');
      if(eyebrow) eyebrow.textContent = 'YÖNETİMİ';

      const pairs = [
        ['debts','debtsPageTitle'],
        ['incomes','incomesPageTitle'],
        ['expenses','expensesPageTitle'],
        ['calendar','calendarPageTitle'],
        ['payments','paymentsPageTitle'],
        ['settings','settingsPageTitle']
      ];

      pairs.forEach(([view,id]) => {
        const el = document.getElementById(id);
        const item = typeof menuItem === 'function' ? menuItem(view) : null;
        if(el && item) el.textContent = item.label;
      });
    }

    const wrapped = function(){
      if(requiredIds.every(id => document.getElementById(id))){
        originalRenderTitles();
      }else{
        fallback();
      }

      document.title = 'BS OFİS BÜTÇE';
      const appTitle = document.getElementById('appTitle');
      if(appTitle) appTitle.textContent = CURRENT_APP_NAME;
      const eyebrow = document.getElementById('orgEyebrow');
      if(eyebrow) eyebrow.textContent = 'YÖNETİMİ';
    };

    wrapped.__bsUiWrapped = true;
    renderTitles = wrapped;
  }

  function refreshServiceWorker(){
    if(!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('./sw.js?v=246', {updateViaCache:'none'})
      .then(reg => reg.update())
      .catch(console.error);
  }

  function loadMobileDialogSafety(){
    if(document.querySelector('script[data-bs-mobile-dialog-safety]')) return;
    const script=document.createElement('script');
    script.src='./v230-mobile-dialog.js?v=235';
    script.dataset.bsMobileDialogSafety='1';
    document.body.appendChild(script);
  }

  function loadShellLock(){
    if(document.querySelector('script[data-bs-shell-lock]')) return;
    const script=document.createElement('script');
    script.src='./v234-shell-lock.js?v=237';
    script.dataset.bsShellLock='1';
    document.body.appendChild(script);
  }

  function loadPaymentEditor(){
    if(window.__bsPaymentEditorV240Loaded || document.querySelector('script[data-bs-payment-editor]')) return;
    const script=document.createElement('script');
    script.src='./payment-editor-v240.js?v=240';
    script.dataset.bsPaymentEditor='1';
    document.body.appendChild(script);
  }

  function loadPaymentModalScrollLock(){
    if(window.__bsV241PaymentModalScrollLockLoaded || document.querySelector('script[data-bs-payment-modal-scroll-lock]')) return;
    const script=document.createElement('script');
    script.src='./v241-payment-modal-scroll-lock.js?v=241';
    script.dataset.bsPaymentModalScrollLock='1';
    document.body.appendChild(script);
  }

  function loadPaymentSaveUi(){
    if(window.__bsV242PaymentSaveUiLoaded || document.querySelector('script[data-bs-payment-save-ui]')) return;
    const script=document.createElement('script');
    script.src='./v242-payment-save-ui.js?v=242';
    script.dataset.bsPaymentSaveUi='1';
    document.body.appendChild(script);
  }

  function loadMonthlyReport(){
    if(window.__bsMonthlyReportV244Loaded || document.querySelector('script[data-bs-monthly-report]')) return;
    const script=document.createElement('script');
    script.src='./v244-monthly-report.js?v=244';
    script.dataset.bsMonthlyReport='1';
    document.body.appendChild(script);
  }

  function loadReportPrintFix(){
    if(window.__bsReportPrintFixV245Loaded || document.querySelector('script[data-bs-report-print-fix]')) return;
    const script=document.createElement('script');
    script.src='./v245-report-print-fix.js?v=245';
    script.dataset.bsReportPrintFix='1';
    document.body.appendChild(script);
  }

  function loadDirectPdfReport(){
    if(window.__bsDirectPdfReportV246Loaded || document.querySelector('script[data-bs-direct-pdf-report]')) return;
    const script=document.createElement('script');
    script.src='./v246-direct-pdf-report.js?v=246';
    script.dataset.bsDirectPdfReport='1';
    document.body.appendChild(script);
  }

  migrateConfig();
  installViewStateGuard();
  installSafeTitleRenderer();
  refreshServiceWorker();
  setTimeout(loadMobileDialogSafety,0);
  setTimeout(loadShellLock,0);
  setTimeout(loadPaymentEditor,0);
  setTimeout(loadPaymentModalScrollLock,0);
  setTimeout(loadPaymentSaveUi,0);
  setTimeout(loadMonthlyReport,0);
  setTimeout(loadReportPrintFix,0);
  setTimeout(loadDirectPdfReport,0);
})();
