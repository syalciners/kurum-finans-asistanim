/* BS OFİS BÜTÇE V2.3.0 - Mobil dialog güvenliği */
(() => {
  if(window.__bsV230MobileDialogLoaded) return;
  window.__bsV230MobileDialogLoaded=true;

  function ensureStyles(){
    if(document.querySelector('#bsV230MobileDialogStyles')) return;
    const style=document.createElement('style');
    style.id='bsV230MobileDialogStyles';
    style.textContent=`
      #detailDialog{position:relative!important;overflow:visible!important}
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
        visibility:hidden!important;
        pointer-events:none!important;
      }
      #detailDialog .bs-detail-floating-close{
        position:absolute!important;
        top:12px!important;
        right:12px!important;
        z-index:200!important;
        width:38px!important;
        height:38px!important;
        display:grid!important;
        place-items:center!important;
        padding:0!important;
        border:1px solid #e2e8f0!important;
        border-radius:50%!important;
        background:rgba(248,250,252,.98)!important;
        color:#0f172a!important;
        box-shadow:0 4px 14px rgba(15,23,42,.12)!important;
        font-size:23px!important;
        line-height:1!important;
        font-weight:700!important;
        cursor:pointer!important;
        -webkit-tap-highlight-color:transparent!important;
        touch-action:manipulation!important;
      }
      #detailDialog .bs-detail-floating-close:active{
        transform:scale(.96)!important;
        background:#f1f5f9!important;
      }
      @media(max-width:520px){
        #detailDialog .bs-detail-floating-close{
          top:10px!important;
          right:10px!important;
          width:40px!important;
          height:40px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function detailDialog(){
    return document.querySelector('#detailDialog');
  }

  function recordFor(module,id){
    try{
      if(module==='debts'){
        return state.debts.map(normalizeDebt).find(x=>x.id===id)||null;
      }
      if(module==='expenses'){
        return state.expenses.map(normalizeExpense).find(x=>x.id===id)||null;
      }
    }catch(_e){}
    return null;
  }

  function closeDetail(){
    const dialog=detailDialog();
    if(!dialog) return;
    try{
      if(dialog.open) dialog.close();
    }catch(_e){
      dialog.removeAttribute('open');
    }
  }

  function closeDetailThen(callback){
    const dialog=detailDialog();
    let done=false;
    const finish=()=>{
      if(done) return;
      done=true;
      setTimeout(()=>requestAnimationFrame(callback),30);
    };

    if(!dialog || !dialog.open){
      finish();
      return;
    }

    dialog.addEventListener('close',finish,{once:true});
    try{ dialog.close(); }
    catch(_e){ dialog.removeAttribute('open'); }

    // iOS/PWA close event gecikirse güvenli geri dönüş.
    setTimeout(()=>{
      if(!dialog.open) finish();
    },120);
  }

  function ensureFloatingClose(){
    const dialog=detailDialog();
    if(!dialog || dialog.querySelector('.bs-detail-floating-close')) return;
    const button=document.createElement('button');
    button.type='button';
    button.className='bs-detail-floating-close';
    button.setAttribute('aria-label','Detayı kapat');
    button.setAttribute('title','Kapat');
    button.textContent='×';
    dialog.appendChild(button);
  }

  // Capture fazında eski bubbling handler'lardan önce çalışır.
  document.addEventListener('click',e=>{
    const close=e.target.closest('#detailDialog .bs-detail-floating-close, #detailDialog .close-detail');
    if(close){
      e.preventDefault();
      e.stopImmediatePropagation();
      closeDetail();
      return;
    }

    const edit=e.target.closest('#detailDialog [data-edit-record]');
    if(edit){
      e.preventDefault();
      e.stopImmediatePropagation();

      const module=edit.dataset.editRecord||'';
      const id=edit.dataset.recordId||'';
      const record=recordFor(module,id);
      if(!record) return;

      closeDetailThen(()=>{
        try{ openRecordDialog(module,record); }
        catch(err){
          console.error('Mobil düzenleme penceresi açılamadı:',err);
          if(typeof toast==='function') toast('Düzenleme penceresi açılamadı. Tekrar deneyin.');
        }
      });
    }
  },true);

  // Backdrop'a dokunulursa da detay kapanabilsin.
  document.addEventListener('click',e=>{
    const dialog=detailDialog();
    if(dialog?.open && e.target===dialog){
      e.preventDefault();
      closeDetail();
    }
  },true);

  ensureStyles();
  ensureFloatingClose();
})();
