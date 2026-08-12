/* BS OFİS BÜTÇE V2.2.8 - Tüm plan türleri için taksit planı düzenleme UX */
(() => {
  if(window.__bsScheduleEditorUxV228Bootstrap) return;
  window.__bsScheduleEditorUxV228Bootstrap=true;

  const EPS=.005;

  function getPlanState(record={}){
    const d=typeof normalizeDebt==='function' ? normalizeDebt(record) : record;
    const exact=Array.isArray(d?.custom?.installment_schedule)
      ?d.custom.installment_schedule.filter(x=>x?.date && +x?.amount>EPS)
      :[];

    let summary=null;
    try{
      summary=typeof window.bsDebtPlanSummary==='function'
        ?window.bsDebtPlanSummary(d)
        :null;
    }catch(_e){
      summary=null;
    }

    const summaryRows=Array.isArray(summary?.rows)?summary.rows:[];
    const remRaw=d?.custom?.remaining_installments;
    const rem=remRaw===''||remRaw==null||Number.isNaN(+remRaw)
      ?null
      :Math.max(0,Math.floor(+remRaw));

    const fallback=!!(
      d?.status!=='closed' &&
      d?.dueDate &&
      +d?.minimum>EPS &&
      rem!=null && rem>0
    );

    const summaryHasPlan=!!(
      summary &&
      summary.kind!=='closed' &&
      summary.kind!=='unknown' &&
      summaryRows.length>0
    );

    return {
      d,
      exact,
      summary,
      rem,
      hasExact:exact.length>0,
      hasPlan:exact.length>0 || summaryHasPlan || fallback
    };
  }

  function planCount(state){
    const s=state.summary;
    if(s?.recordedCount!=null && +s.recordedCount>=0) return Math.floor(+s.recordedCount);
    if(state.exact.length) return state.exact.length;
    if(state.rem!=null) return state.rem;
    if(Array.isArray(s?.rows)) return s.rows.length;
    return 0;
  }

  function tuneEditor(record={}){
    const editor=document.querySelector('#recordFields .bs-schedule-editor');
    if(!editor) return;

    const body=editor.querySelector('.bs-schedule-editor-body');
    const toggle=editor.querySelector('.bs-schedule-editor-toggle');
    const generator=editor.querySelector('.bs-schedule-generator');
    const titleSmall=editor.querySelector('.bs-schedule-editor-title small');
    if(!body || !toggle) return;

    const state=getPlanState(record);
    const count=planCount(state);

    body.hidden=true;
    toggle.setAttribute('aria-expanded','false');
    toggle.textContent=state.hasPlan?'Planı Düzenle':'Plan Ekle';

    if(titleSmall){
      if(state.hasExact){
        titleSmall.textContent=`${count||state.exact.length} kesin ödeme kayıtlı · tarih ve tutarlar düzenlenebilir`;
      }else if(state.hasPlan){
        titleSmall.textContent=`${count?`${count} taksitlik `:''}mevcut plan kayıtlı · plan bilgilerini buradan yönetebilirsin`;
      }else{
        titleSmall.textContent='Banka veya kredi planını tarih ve tutar satırlarıyla tanımla';
      }
    }

    if(generator){
      const genHead=generator.querySelector('.bs-schedule-generator-head strong');
      const genSmall=generator.querySelector('.bs-schedule-generator-head small');
      const start=generator.querySelector('[data-generator-start]');
      const genCount=generator.querySelector('[data-generator-count]');
      const amount=generator.querySelector('[data-generator-amount]');

      if(state.hasExact){
        generator.hidden=true;

        if(!editor.querySelector('.bs-schedule-rebuild')){
          const rebuild=document.createElement('button');
          rebuild.type='button';
          rebuild.className='bs-schedule-rebuild';
          rebuild.textContent='Planı Yeniden Oluştur';
          rebuild.style.cssText='min-height:34px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#475569;font-size:9px;font-weight:820;cursor:pointer';
          generator.insertAdjacentElement('beforebegin',rebuild);

          rebuild.addEventListener('click',()=>{
            generator.hidden=!generator.hidden;
            rebuild.textContent=generator.hidden
              ?'Planı Yeniden Oluştur'
              :'Yeniden Oluşturmayı Kapat';
          });
        }
      }else{
        generator.hidden=false;
        if(state.hasPlan){
          if(genHead) genHead.textContent='Mevcut planı kesinleştir';
          if(genSmall) genSmall.textContent='Mevcut aylık plan bilgilerini gerçek tarih ve tutar satırlarına dönüştürür. Kaydetmeden önce satırları kontrol edebilirsin.';
          if(start && !start.value) start.value=state.d?.dueDate||'';
          if(genCount && !genCount.value && count>0) genCount.value=String(count);
          if(amount && !amount.value && +state.d?.minimum>EPS) amount.value=String(+state.d.minimum);
        }
      }
    }

    if(!toggle.dataset.bsPlanAwareToggle){
      toggle.dataset.bsPlanAwareToggle='1';
      toggle.addEventListener('click',e=>{
        e.preventDefault();
        e.stopImmediatePropagation();

        const opening=body.hidden;
        body.hidden=!opening;
        toggle.setAttribute('aria-expanded',opening?'true':'false');

        if(opening){
          toggle.textContent='Planı Kapat';
        }else{
          const cleared=editor.dataset.cleared==='1';
          const editorRows=editor.querySelectorAll('.bs-schedule-row').length;
          const stillHasPlan=!cleared && (state.hasPlan || editorRows>0);
          toggle.textContent=stillHasPlan?'Planı Düzenle':'Plan Ekle';
        }
      },true);
    }
  }

  function install(){
    if(window.__bsScheduleEditorUxV228Loaded) return;

    if(
      !window.__bsScheduleEditorV226Loaded ||
      typeof openRecordDialog!=='function'
    ){
      setTimeout(install,50);
      return;
    }

    const originalOpenRecordDialogV228=openRecordDialog;
    const wrapped=function(module,record=null){
      const result=originalOpenRecordDialogV228(module,record);
      if(module==='debts') tuneEditor(record||{});
      return result;
    };

    wrapped.__bsScheduleEditorUxV228=true;
    openRecordDialog=wrapped;
    window.__bsScheduleEditorUxV228Loaded=true;

    const currentModule=document.querySelector('#recordForm [name="module"]')?.value;
    if(currentModule==='debts' && document.querySelector('#recordDialog')?.open){
      const id=document.querySelector('#recordForm [name="id"]')?.value||'';
      const record=id
        ?state.debts.map(normalizeDebt).find(x=>x.id===id)||{}
        :{};
      tuneEditor(record);
    }
  }

  install();
})();
