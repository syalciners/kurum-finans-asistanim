/* BS OFİS BÜTÇE V2.2.9 - Plan durumu + sticky detay başlığı */
(() => {
  if(window.__bsV229FixesLoaded) return;
  window.__bsV229FixesLoaded=true;

  const EPS=.005;

  function ensureStyles(){
    if(document.querySelector('#bsV229FixStyles')) return;
    const style=document.createElement('style');
    style.id='bsV229FixStyles';
    style.textContent=`
      #detailDialog .dialog-form{position:relative}
      #detailDialog .dialog-head{
        position:sticky;
        top:0;
        z-index:60;
        background:rgba(255,255,255,.97);
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
        padding:4px 0 10px;
        border-bottom:1px solid rgba(226,232,240,.82);
      }
      #detailDialog .dialog-head .close-detail,
      #detailDialog .dialog-head .icon-btn{flex:0 0 auto}
    `;
    document.head.appendChild(style);
  }

  function formNumber(name){
    const el=document.querySelector(`#recordForm [name="${name}"]`);
    const n=+(el?.value||0);
    return Number.isFinite(n)?n:0;
  }

  function currentRecord(){
    const form=document.querySelector('#recordForm');
    if(!form || form.querySelector('[name="module"]')?.value!=='debts') return null;
    const id=form.querySelector('[name="id"]')?.value||'';
    if(!id || !window.state?.debts) return null;
    try{
      return state.debts.map(normalizeDebt).find(x=>x.id===id)||null;
    }catch(_e){
      return null;
    }
  }

  function planState(){
    const record=currentRecord();
    let summary=null;

    if(record && typeof window.bsDebtPlanSummary==='function'){
      try{ summary=window.bsDebtPlanSummary(record); }
      catch(_e){ summary=null; }
    }

    const summaryRows=Array.isArray(summary?.rows)?summary.rows:[];
    const exact=Array.isArray(record?.custom?.installment_schedule)
      ?record.custom.installment_schedule.filter(x=>x?.date && +x?.amount>EPS)
      :[];

    const dueDate=document.querySelector('#recordForm [name="dueDate"]')?.value || record?.dueDate || '';
    const minimum=formNumber('minimum') || +(record?.minimum||0);
    const remField=document.querySelector('#recordForm [name="custom__remaining_installments"]');
    const remRaw=remField?.value ?? record?.custom?.remaining_installments;
    const remaining=remRaw===''||remRaw==null||Number.isNaN(+remRaw)
      ?null
      :Math.max(0,Math.floor(+remRaw));

    const enginePlan=!!(
      summary &&
      summary.kind!=='closed' &&
      summary.kind!=='unknown' &&
      summaryRows.length>0
    );

    const fieldPlan=!!(
      dueDate &&
      minimum>EPS &&
      remaining!=null &&
      remaining>0
    );

    return {
      record,
      summary,
      exact,
      remaining,
      minimum,
      dueDate,
      hasExact:exact.length>0,
      hasPlan:exact.length>0 || enginePlan || fieldPlan
    };
  }

  function tuneEditor(){
    const editor=document.querySelector('#recordFields .bs-schedule-editor');
    if(!editor) return;

    const body=editor.querySelector('.bs-schedule-editor-body');
    const toggle=editor.querySelector('.bs-schedule-editor-toggle');
    const generator=editor.querySelector('.bs-schedule-generator');
    const titleSmall=editor.querySelector('.bs-schedule-editor-title small');
    if(!body || !toggle) return;

    const ps=planState();
    const expanded=toggle.getAttribute('aria-expanded')==='true' && !body.hidden;

    toggle.textContent=expanded
      ?'Planı Kapat'
      :(ps.hasPlan?'Planı Düzenle':'Plan Ekle');

    if(titleSmall){
      if(ps.hasExact){
        const count=ps.remaining ?? ps.exact.length;
        titleSmall.textContent=`${count} kesin ödeme kayıtlı · tarih ve tutarlar düzenlenebilir`;
      }else if(ps.hasPlan){
        const count=ps.remaining;
        titleSmall.textContent=`${count?`${count} taksitlik `:''}mevcut plan kayıtlı`;
      }else{
        titleSmall.textContent='Banka veya kredi planını tarih ve tutar satırlarıyla tanımla';
      }
    }

    if(generator && ps.hasPlan && !ps.hasExact){
      const head=generator.querySelector('.bs-schedule-generator-head strong');
      const small=generator.querySelector('.bs-schedule-generator-head small');
      const start=generator.querySelector('[data-generator-start]');
      const count=generator.querySelector('[data-generator-count]');
      const amount=generator.querySelector('[data-generator-amount]');
      if(head) head.textContent='Mevcut planı kesinleştir';
      if(small) small.textContent='Mevcut taksit bilgilerini gerçek tarih ve tutar satırlarına dönüştürür. Kaydetmeden önce kontrol edebilirsin.';
      if(start && !start.value) start.value=ps.dueDate||'';
      if(count && !count.value && ps.remaining>0) count.value=String(ps.remaining);
      if(amount && !amount.value && ps.minimum>EPS) amount.value=String(ps.minimum);
    }
  }

  document.addEventListener('click',e=>{
    const toggle=e.target.closest('.bs-schedule-editor-toggle');
    if(!toggle) return;

    const editor=toggle.closest('.bs-schedule-editor');
    const body=editor?.querySelector('.bs-schedule-editor-body');
    if(!editor || !body) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const opening=body.hidden;
    body.hidden=!opening;
    toggle.setAttribute('aria-expanded',opening?'true':'false');
    toggle.textContent=opening?'Planı Kapat':(planState().hasPlan?'Planı Düzenle':'Plan Ekle');
  },true);

  const observer=new MutationObserver(()=>queueMicrotask(tuneEditor));
  const target=document.querySelector('#recordFields');
  if(target) observer.observe(target,{childList:true,subtree:true,attributes:true});

  document.querySelector('#recordDialog')?.addEventListener('close',()=>setTimeout(tuneEditor,0));
  document.addEventListener('input',e=>{
    if(e.target.closest('#recordForm')) queueMicrotask(tuneEditor);
  });
  document.addEventListener('change',e=>{
    if(e.target.closest('#recordForm')) queueMicrotask(tuneEditor);
  });

  ensureStyles();
  tuneEditor();
})();
