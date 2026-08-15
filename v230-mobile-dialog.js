/* BS OFİS BÜTÇE V2.5.7.1 - Mobil dialog ve viewport yatay kayma koruması */
(() => {
  if(window.__bsV235MobileDialogLoaded) return;
  window.__bsV235MobileDialogLoaded=true;

  function ensureStyles(){
    if(document.querySelector('#bsV235MobileDialogStyles')) return;
    const style=document.createElement('style');
    style.id='bsV235MobileDialogStyles';
    style.textContent=`
      html,body{
        width:100%;
        max-width:100%;
        overflow-x:hidden!important;
        overscroll-behavior-x:none;
      }
      .app-shell,#main,.view{
        max-width:100%;
        min-width:0;
      }

      /* Detay başlığı: içerik kayarken başlık + kapatma sabit kalır. */
      #detailDialog .dialog-form{position:relative!important}
      #detailDialog .dialog-head{
        position:sticky!important;
        top:0!important;
        z-index:120!important;
        background:#fff!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        padding:0 0 12px!important;
        margin-bottom:12px!important;
        border-bottom:1px solid #eef2f7!important;
        box-shadow:0 8px 14px -16px rgba(15,23,42,.55)!important;
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

      /* Düzenleme formu: yalnız dikey kayar, yatay taşma yok. */
      #recordDialog{
        width:min(620px,calc(100vw - 24px))!important;
        max-width:calc(100vw - 24px)!important;
        max-height:calc(100dvh - 24px)!important;
        padding:0!important;
        overflow:hidden!important;
        overscroll-behavior-x:none!important;
      }
      #recordDialog .dialog-form{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        max-height:calc(100dvh - 24px)!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        overscroll-behavior-x:none!important;
        box-sizing:border-box!important;
      }

      /* Kaydı Düzenle başlığı: form alanları kayarken üstte sabit kalır. */
      #recordDialog .dialog-head{
        position:sticky!important;
        top:0!important;
        z-index:120!important;
        background:#fff!important;
        padding:2px 0 12px!important;
        margin-bottom:12px!important;
        border-bottom:1px solid #eef2f7!important;
        box-shadow:0 8px 14px -16px rgba(15,23,42,.55)!important;
      }

      #recordDialog .dialog-head,
      #recordDialog #recordFields,
      #recordDialog #recordFields > *,
      #recordDialog .stack,
      #recordDialog .stack > *,
      #recordDialog label,
      #recordDialog input,
      #recordDialog select,
      #recordDialog textarea,
      #recordDialog button,
      #recordDialog .bs-schedule-editor,
      #recordDialog .bs-schedule-editor-head,
      #recordDialog .bs-schedule-editor-body,
      #recordDialog .bs-schedule-generator,
      #recordDialog .bs-schedule-generator-grid,
      #recordDialog .bs-schedule-rows,
      #recordDialog .bs-schedule-row{
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      #recordDialog input,
      #recordDialog select,
      #recordDialog textarea{
        width:100%!important;
      }
      #recordDialog textarea{
        overflow-wrap:anywhere!important;
        word-break:break-word!important;
      }
      #recordDialog .dialog-head h3,
      #recordDialog .bs-schedule-editor-title{
        min-width:0!important;
        overflow-wrap:anywhere!important;
      }

      @media(max-width:520px){
        #recordDialog{
          width:calc(100vw - 24px)!important;
          max-width:calc(100vw - 24px)!important;
          margin:auto!important;
        }
        #recordDialog .dialog-form{
          padding:16px!important;
        }
        #recordDialog .dialog-head{
          gap:10px!important;
        }
        #recordDialog .dialog-head h3{
          font-size:20px!important;
          line-height:1.15!important;
        }
        #recordDialog .dialog-head .close-dialog{
          flex:0 0 38px!important;
          width:38px!important;
          height:38px!important;
        }
        #recordDialog .bs-schedule-generator-grid{
          grid-template-columns:minmax(0,1fr)!important;
        }
        #recordDialog .bs-schedule-generator-grid label:first-child{
          grid-column:auto!important;
        }
        #recordDialog .bs-schedule-row{
          grid-template-columns:minmax(0,1fr) 36px!important;
        }
        #recordDialog .bs-schedule-row [data-schedule-date]{
          grid-column:1/-1!important;
        }
        #recordDialog .bs-schedule-row [data-schedule-amount]{
          grid-column:1!important;
        }
        #recordDialog .bs-schedule-remove{
          grid-column:2!important;
          width:36px!important;
          height:36px!important;
        }
      }
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

  function resetRecordHorizontal(){
    const dialog=document.querySelector('#recordDialog');
    const form=document.querySelector('#recordForm');
    const fields=document.querySelector('#recordFields');
    [dialog,form,fields].forEach(el=>{
      if(el && el.scrollLeft!==0) el.scrollLeft=0;
    });
  }

  function resetPageHorizontal(){
    const scrolling=document.scrollingElement;
    const y=window.scrollY || scrolling?.scrollTop || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const targets=[
      scrolling,
      document.documentElement,
      document.body,
      document.querySelector('.app-shell'),
      document.querySelector('#main')
    ];

    targets.forEach(el=>{
      if(el && el.scrollLeft!==0) el.scrollLeft=0;
    });

    if(window.scrollX!==0 || window.pageXOffset!==0){
      window.scrollTo(0,y);
    }
  }

  function resetAllHorizontal(){
    resetRecordHorizontal();
    resetPageHorizontal();
  }

  function scheduleViewportReset(){
    resetAllHorizontal();
    requestAnimationFrame(()=>{
      resetAllHorizontal();
      requestAnimationFrame(resetAllHorizontal);
    });
    setTimeout(resetAllHorizontal,80);
    setTimeout(resetAllHorizontal,220);
  }

  ensureStyles();

  if(typeof showDetail==='function' && !showDetail.__bsV235SafeDialog){
    const originalShowDetailV235=showDetail;
    const wrapped=function(module,record){
      const result=originalShowDetailV235(module,record);
      queueMicrotask(ensureBottomClose);
      return result;
    };
    wrapped.__bsV235SafeDialog=true;
    showDetail=wrapped;
  }

  const detailContent=document.querySelector('#detailContent');
  if(detailContent){
    const observer=new MutationObserver(()=>queueMicrotask(ensureBottomClose));
    observer.observe(detailContent,{childList:true,subtree:false});
  }

  const recordDialog=document.querySelector('#recordDialog');
  if(recordDialog){
    const openObserver=new MutationObserver(()=>{
      if(recordDialog.open){
        requestAnimationFrame(()=>{
          resetRecordHorizontal();
          requestAnimationFrame(resetRecordHorizontal);
        });
      }else{
        scheduleViewportReset();
      }
    });
    openObserver.observe(recordDialog,{attributes:true,attributeFilter:['open']});

    recordDialog.addEventListener('scroll',()=>{
      if(recordDialog.scrollLeft) recordDialog.scrollLeft=0;
    },{passive:true});

    recordDialog.addEventListener('close',()=>{
      const active=document.activeElement;
      if(active && recordDialog.contains(active) && typeof active.blur==='function') active.blur();
      scheduleViewportReset();
    });
  }

  document.querySelector('#recordForm')?.addEventListener('scroll',e=>{
    if(e.currentTarget.scrollLeft) e.currentTarget.scrollLeft=0;
  },{passive:true});

  document.addEventListener('click',e=>{
    if(e.target.closest('.bs-schedule-editor-toggle')){
      requestAnimationFrame(resetRecordHorizontal);
    }
  },true);

  window.addEventListener('resize',resetAllHorizontal,{passive:true});
  window.addEventListener('orientationchange',scheduleViewportReset,{passive:true});
  window.visualViewport?.addEventListener('resize',resetAllHorizontal,{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>{
    if(!recordDialog?.open) resetPageHorizontal();
  },{passive:true});

  ensureBottomClose();
  scheduleViewportReset();
})();
