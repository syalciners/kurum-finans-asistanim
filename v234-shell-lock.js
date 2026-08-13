/* BS OFİS BÜTÇE V2.3.4 - Sabit üst bar ve alt sekme kabuğu */
(() => {
  if(window.__bsV234ShellLockLoaded) return;
  window.__bsV234ShellLockLoaded=true;

  function ensureStyles(){
    if(document.querySelector('#bsV234ShellLockStyles')) return;
    const style=document.createElement('style');
    style.id='bsV234ShellLockStyles';
    style.textContent=`
      :root{
        --bs-shell-top-space:88px;
        --bs-shell-bottom-space:86px;
      }

      html,body{
        max-width:100%;
        overflow-x:hidden!important;
      }

      .app-shell{
        padding-top:var(--bs-shell-top-space)!important;
        padding-bottom:calc(var(--bs-shell-bottom-space) + 14px)!important;
      }

      .app-shell > .topbar{
        position:fixed!important;
        top:0!important;
        left:50%!important;
        right:auto!important;
        transform:translateX(-50%)!important;
        width:min(calc(100vw - 24px),780px)!important;
        max-width:780px!important;
        margin:0!important;
        z-index:1000!important;
        will-change:transform;
      }

      .app-shell > .bottom-nav{
        position:fixed!important;
        left:50%!important;
        right:auto!important;
        transform:translateX(-50%)!important;
        bottom:max(8px,env(safe-area-inset-bottom))!important;
        z-index:1000!important;
        will-change:transform;
      }

      /* Sayfa başlıkları içerikle birlikte kayar; ayrıca sabitlenmez. */
      .view > .page-title{
        position:static!important;
        top:auto!important;
        z-index:auto!important;
      }

      @media(max-width:520px){
        .app-shell > .topbar{
          width:calc(100vw - 16px)!important;
          max-width:calc(100vw - 16px)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function measureBars(){
    const topbar=document.querySelector('.app-shell > .topbar');
    const bottom=document.querySelector('.app-shell > .bottom-nav');
    const root=document.documentElement;

    if(topbar){
      const h=Math.ceil(topbar.getBoundingClientRect().height);
      root.style.setProperty('--bs-shell-top-space',`${Math.max(72,h+14)}px`);
    }
    if(bottom){
      const h=Math.ceil(bottom.getBoundingClientRect().height);
      root.style.setProperty('--bs-shell-bottom-space',`${Math.max(78,h+16)}px`);
    }
  }

  let raf=0;
  function scheduleMeasure(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      measureBars();
      requestAnimationFrame(measureBars);
    });
  }

  ensureStyles();
  scheduleMeasure();
  window.addEventListener('load',scheduleMeasure,{once:true});
  window.addEventListener('resize',scheduleMeasure,{passive:true});
  window.addEventListener('orientationchange',scheduleMeasure,{passive:true});

  if(document.fonts?.ready){
    document.fonts.ready.then(scheduleMeasure).catch(()=>{});
  }
})();
