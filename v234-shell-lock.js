/* BS OFİS BÜTÇE V2.5.7 - Uygulama kabuğu ölçüm katmanı
   Sabit header/nav stilleri v257-foundation.css içinde yüklenir. */
(() => {
  if(window.__bsV234ShellLockLoaded) return;
  window.__bsV234ShellLockLoaded = true;

  function measureBars(){
    const topbar = document.querySelector('.app-shell > .topbar');
    const bottom = document.querySelector('.app-shell > .bottom-nav');
    const root = document.documentElement;

    if(topbar){
      const height = Math.ceil(topbar.getBoundingClientRect().height);
      root.style.setProperty('--bs-shell-top-space',`${Math.max(72,height + 14)}px`);
    }

    if(bottom){
      const height = Math.ceil(bottom.getBoundingClientRect().height);
      root.style.setProperty('--bs-shell-bottom-space',`${Math.max(70,height + 12)}px`);
    }
  }

  let raf = 0;
  function scheduleMeasure(){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      measureBars();
      requestAnimationFrame(measureBars);
    });
  }

  scheduleMeasure();
  window.addEventListener('load',scheduleMeasure,{once:true});
  window.addEventListener('resize',scheduleMeasure,{passive:true});
  window.addEventListener('orientationchange',scheduleMeasure,{passive:true});

  if(document.fonts?.ready){
    document.fonts.ready.then(scheduleMeasure).catch(() => {});
  }
})();
