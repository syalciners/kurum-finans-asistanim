/* BS OFİS BÜTÇE - Gelecek taksit planı V1 */
(() => {
  if(window.__bsPaymentScheduleLoaded) return;
  window.__bsPaymentScheduleLoaded=true;

  const EPS=.005;

  function parseTrAmount(value){
    let s=String(value??'').trim().replace(/\s/g,'');
    if(!s) return 0;
    if(s.includes('.') && s.includes(',')){
      s=s.replace(/\./g,'').replace(',','.');
    }else if(s.includes(',')){
      s=s.replace(',','.');
    }else if(/^\d{1,3}(?:\.\d{3})+$/.test(s)){
      s=s.replace(/\./g,'');
    }
    const n=Number(s);
    return Number.isFinite(n)?n:0;
  }

  function noteNextPayment(raw){
    const d=normalizeDebt(raw);
    const note=String(d.notes||'');
    const match=note.match(/sonraki\s+aylarda\s+([\d.,]+)\s*(?:tl|₺)?/i);
    return match?parseTrAmount(match[1]):0;
  }

  function configuredNextPayment(raw){
    const d=normalizeDebt(raw);
    const technical=+(d.custom?.next_payment_after_current||0);
    return technical>EPS?technical:noteNextPayment(d);
  }

  window.bsNextScheduledPayment=configuredNextPayment;

  async function migrateLegacyNotes(){
    const changed=[];

    state.debts.forEach(raw=>{
      const d=normalizeDebt(raw);
      const current=+(d.custom?.next_payment_after_current||0);
      if(current>EPS) return;

      const inferred=noteNextPayment(d);
      if(inferred<=EPS) return;

      const custom={...(raw.custom||raw.ozel_alanlar||{})};
      custom.next_payment_after_current=inferred;
      custom.next_payment_source='not_migrasyonu_v1';
      raw.custom=custom;
      raw.updatedAt=new Date().toISOString();
      changed.push(raw);
    });

    if(!changed.length) return false;

    saveState(false);

    if(session){
      for(const raw of changed){
        try{
          await cloudUpsertDebt(normalizeDebt(raw));
        }catch(e){
          console.warn('Gelecek taksit planı bulut güncellemesi tamamlanamadı:',e);
        }
      }
    }

    return true;
  }

  function enhanceDebtDetail(record){
    const next=configuredNextPayment(record);
    if(next<=EPS) return;

    const d=normalizeDebt(record);
    const content=document.querySelector('#detailContent');
    if(!content) return;

    const heroMeta=content.querySelector('.v179-detail-main small');
    if(heroMeta && !heroMeta.dataset.nextPaymentEnhanced){
      heroMeta.dataset.nextPaymentEnhanced='1';
      heroMeta.textContent=`${heroMeta.textContent} · Sonraki aylarda ${money(next)}`;
    }

    const grid=content.querySelector('.detail-grid');
    if(grid && !grid.querySelector('.bs-next-payment-row')){
      const row=document.createElement('div');
      row.className='detail-row bs-next-payment-row';
      row.innerHTML=`<span>Sonraki aylardaki ödeme</span><strong>${money(next)}</strong>`;
      grid.appendChild(row);
    }
  }

  if(typeof showDetail==='function' && !showDetail.__bsScheduleWrapped){
    const originalShowDetail=showDetail;
    const wrapped=function(module,record){
      originalShowDetail(module,record);
      if(module==='debts') enhanceDebtDetail(record);
    };
    wrapped.__bsScheduleWrapped=true;
    showDetail=wrapped;
  }

  async function init(){
    const changed=await migrateLegacyNotes();
    if(changed){
      try{
        renderDashboard();
        renderDebts();
        renderCalendar();
      }catch(_e){}
    }
  }

  setTimeout(init,0);
})();