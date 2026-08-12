/* BS OFİS BÜTÇE V2.3.1 - Mobil dialog güvenli geri dönüş */
(() => {
  if(window.__bsV231MobileDialogLoaded) return;
  window.__bsV231MobileDialogLoaded=true;

  function ensureStyles(){
    if(document.querySelector('#bsV231MobileDialogStyles')) return;
    const style=document.createElement('style');
    style.id='bsV231MobileDialogStyles';
    style.textContent=`
      /* V229 sticky müdahalesini geri al: native dialog davranışı korunur. */
      #detailDialog .dialog-form{position:relative!important}
      #detailDialog .dialog-head{
        position:static!important;
        top:auto!important;
        z-index:auto!important;
        background:transparent!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        padding:0!important;
        border-bottom:0!important;
      }
      #detailDialog .dialog-head .close-detail{
        visibility:visible!important;
        pointer-events:auto!important;
      }
      #detailDialog .bs-detail-floating-close{display:none!important}
      #detailDialog .bs-detail-bottom-close{
        width:100%!important;
        min-height:44px!important;
        margin-top:2px!important;
        border:1px solid #e2e8f0!important;
        border-radius:12px!important;
        background:#fff!important;
        color:#475569!important;
        font-size:12px!important;
        font-weight:800!important;
        cursor:pointer!important;
        touch-action:manipulation!important;
        -webkit-tap-highlight-color:transparent!important;
      }
      #detailDialog .bs-detail-bottom-close:active{background:#f8fafc!important}
    `;
    document.head.appendChild(style);
  }

  function ensureBottomClose(){
    const content=document.querySelector('#detailContent');
    if(!content) return;

    content.querySelectorAll('.bs-detail-floating-close').forEach(x=>x.remove());
    if(content.querySelector('.bs-detail-bottom-close')) return;

    const button=document.createElement('button');
    button.type='button';
    button.className='secondary close-detail bs-detail-bottom-close';
    button.textContent='Kapat';
    button.setAttribute('aria-label','Detay penceresini kapat');
    content.appendChild(button);
  }

  ensureStyles();

  if(typeof showDetail==='function' && !showDetail.__bsV231SafeDialog){
    const originalShowDetailV231=showDetail;
    const wrapped=function(module,record){
      const result=originalShowDetailV231(module,record);
      queueMicrotask(ensureBottomClose);
      return result;
    };
    wrapped.__bsV231SafeDialog=true;
    showDetail=wrapped;
  }

  const content=document.querySelector('#detailContent');
  if(content){
    const observer=new MutationObserver(()=>queueMicrotask(ensureBottomClose));
    observer.observe(content,{childList:true,subtree:false});
  }

  ensureBottomClose();
})();
