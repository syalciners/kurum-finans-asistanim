/* BS OFİS BÜTÇE V2.4.1 - Ödeme düzenleme modalı arka plan kaydırma kilidi */
(() => {
  if(window.__bsV241PaymentModalScrollLockLoaded) return;
  window.__bsV241PaymentModalScrollLockLoaded=true;

  const dialog=document.querySelector('#recordDialog');
  const form=document.querySelector('#recordForm');
  if(!dialog||!form) return;

  let locked=false;
  let scrollY=0;
  let previous=null;

  function isExistingPaymentEdit(){
    return dialog.open
      && form.querySelector('[name="module"]')?.value==='payments'
      && !!form.querySelector('[name="id"]')?.value;
  }

  function lockBackground(){
    if(locked||!isExistingPaymentEdit()) return;
    locked=true;
    scrollY=window.scrollY||window.pageYOffset||0;
    previous={
      htmlOverflow:document.documentElement.style.overflow,
      bodyPosition:document.body.style.position,
      bodyTop:document.body.style.top,
      bodyLeft:document.body.style.left,
      bodyRight:document.body.style.right,
      bodyWidth:document.body.style.width,
      bodyOverflow:document.body.style.overflow
    };
    document.documentElement.style.overflow='hidden';
    document.body.style.position='fixed';
    document.body.style.top=`-${scrollY}px`;
    document.body.style.left='0';
    document.body.style.right='0';
    document.body.style.width='100%';
    document.body.style.overflow='hidden';
  }

  function unlockBackground(){
    if(!locked) return;
    locked=false;
    const y=scrollY;
    const p=previous||{};
    document.documentElement.style.overflow=p.htmlOverflow||'';
    document.body.style.position=p.bodyPosition||'';
    document.body.style.top=p.bodyTop||'';
    document.body.style.left=p.bodyLeft||'';
    document.body.style.right=p.bodyRight||'';
    document.body.style.width=p.bodyWidth||'';
    document.body.style.overflow=p.bodyOverflow||'';
    previous=null;
    requestAnimationFrame(()=>window.scrollTo(0,y));
  }

  function syncLock(){
    if(isExistingPaymentEdit()) lockBackground();
    else unlockBackground();
  }

  new MutationObserver(syncLock).observe(dialog,{attributes:true,attributeFilter:['open']});
  dialog.addEventListener('close',unlockBackground);
  dialog.addEventListener('cancel',unlockBackground);
  window.addEventListener('pagehide',unlockBackground,{once:true});
  syncLock();
})();
