/* BS OFİS BÜTÇE - Gelecek taksit planı V2 */
(() => {
  if(window.__bsPaymentScheduleLoaded) return;
  window.__bsPaymentScheduleLoaded=true;

  const EPS=.005;
  const PREVIEW_LIMIT=6;

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

  function installmentPaid(raw){
    const d=normalizeDebt(raw);
    return Math.max(0,+(d.custom?.current_installment_paid||0));
  }

  function currentRemaining(raw){
    if(typeof window.currentInstallmentRemaining==='function'){
      return Math.max(0,+window.currentInstallmentRemaining(raw)||0);
    }
    const d=normalizeDebt(raw);
    return Math.max(0,(+d.minimum||0)-installmentPaid(d));
  }

  function remainingInstallments(raw){
    const d=normalizeDebt(raw);
    const n=d.custom?.remaining_installments;
    if(n==='' || n==null || Number.isNaN(+n)) return null;
    return Math.max(0,Math.floor(+n));
  }

  function addMonthsSafe(dateString,months){
    if(!dateString) return '';
    try{
      return addMonths(parseDate(dateString),months).toISOString().slice(0,10);
    }catch(_e){
      return '';
    }
  }

  function planRows(raw){
    const d=normalizeDebt(raw);
    if(d.status==='closed' || !d.dueDate) return [];

    const remainingCount=remainingInstallments(d);
    const rowCount=remainingCount==null?1:Math.max(1,remainingCount);
    const nextAmount=configuredNextPayment(d);
    const currentAmount=currentRemaining(d);
    const recurringAmount=nextAmount>EPS?nextAmount:(+d.minimum||0);
    const paid=installmentPaid(d);
    const rows=[];

    for(let i=0;i<rowCount && i<120;i++){
      const isCurrent=i===0;
      const amount=isCurrent?currentAmount:recurringAmount;
      if(amount<=EPS) continue;

      rows.push({
        index:i+1,
        isCurrent,
        date:addMonthsSafe(d.dueDate,i),
        amount,
        planned:isCurrent?(+d.minimum||0):recurringAmount,
        paid:isCurrent?paid:0
      });
    }

    return rows;
  }

  function ensureStyles(){
    if(document.querySelector('#bsPaymentScheduleStyles')) return;
    const style=document.createElement('style');
    style.id='bsPaymentScheduleStyles';
    style.textContent=`
      .bs-installment-plan{
        margin-top:12px;
        border:1px solid var(--line,#E2E8F0);
        border-radius:16px;
        background:#fff;
        overflow:hidden;
      }
      .bs-installment-plan-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
        padding:13px 14px 11px;
        border-bottom:1px solid var(--line,#E2E8F0);
        background:#F8FAFC;
      }
      .bs-installment-plan-head div{display:grid;gap:3px}
      .bs-installment-plan-head strong{font-size:12px;color:#0F172A}
      .bs-installment-plan-head small{font-size:9.5px;color:#64748B;line-height:1.35}
      .bs-installment-count{
        flex:0 0 auto;
        padding:5px 8px;
        border-radius:999px;
        background:#EFF6FF;
        color:#2563EB;
        font-size:9px;
        font-weight:850;
      }
      .bs-installment-list{display:grid}
      .bs-installment-row{
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        align-items:center;
        gap:12px;
        padding:10px 14px;
        border-bottom:1px solid #EEF2F7;
      }
      .bs-installment-row:last-child{border-bottom:0}
      .bs-installment-row[hidden]{display:none!important}
      .bs-installment-main{min-width:0;display:grid;gap:3px}
      .bs-installment-main strong{font-size:11px;color:#0F172A}
      .bs-installment-main small{font-size:9px;color:#64748B}
      .bs-installment-current{
        display:inline-flex;
        width:max-content;
        align-items:center;
        padding:3px 6px;
        border-radius:999px;
        background:#FFF7E8;
        color:#C97800;
        font-size:8px;
        font-weight:850;
        margin-left:5px;
        vertical-align:1px;
      }
      .bs-installment-amount{text-align:right;display:grid;gap:2px}
      .bs-installment-amount strong{font-size:12px;color:#0F172A}
      .bs-installment-amount small{font-size:8.5px;color:#64748B}
      .bs-installment-toggle{
        width:100%;
        min-height:39px;
        border:0;
        border-top:1px solid #EEF2F7;
        background:#fff;
        color:#2563EB;
        font-size:10px;
        font-weight:800;
        cursor:pointer;
      }
      .bs-installment-toggle:active{background:#F8FAFC}
    `;
    document.head.appendChild(style);
  }

  window.bsNextScheduledPayment=configuredNextPayment;
  window.bsDebtInstallmentPlan=planRows;

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

  function renderInstallmentPlan(record,content){
    const rows=planRows(record);
    if(!rows.length || content.querySelector('.bs-installment-plan')) return;

    const d=normalizeDebt(record);
    const next=configuredNextPayment(d);
    const total=remainingInstallments(d);
    const visibleRows=rows.slice(0,PREVIEW_LIMIT);
    const extraRows=rows.slice(PREVIEW_LIMIT);
    const currentPaid=installmentPaid(d);

    const section=document.createElement('section');
    section.className='bs-installment-plan';
    section.innerHTML=`
      <div class="bs-installment-plan-head">
        <div>
          <strong>Taksit Planı</strong>
          <small>${currentPaid>EPS?`Mevcut taksitte ${money(currentPaid)} ödendi · `:''}${next>EPS?`sonraki aylık ${money(next)}`:`aylık ${money(d.minimum||0)}`}</small>
        </div>
        ${total!=null?`<span class="bs-installment-count">${total} taksit kaldı</span>`:''}
      </div>
      <div class="bs-installment-list">
        ${rows.map((row,i)=>{
          const dateText=row.date?parseDate(row.date).toLocaleDateString('tr-TR',{day:'2-digit',month:'short',year:'numeric'}):'Tarih yok';
          const partial=row.isCurrent && row.paid>EPS;
          return `
            <div class="bs-installment-row" ${i>=PREVIEW_LIMIT?'hidden data-extra-installment="1"':''}>
              <div class="bs-installment-main">
                <strong>${row.isCurrent?'Mevcut taksit':`${row.index}. taksit`}${row.isCurrent?'<span class="bs-installment-current">Sıradaki</span>':''}</strong>
                <small>${dateText}${partial?` · Plan ${money(row.planned)}`:''}</small>
              </div>
              <div class="bs-installment-amount">
                <strong>${money(row.amount)}</strong>
                ${partial?`<small>Kalan tutar</small>`:'<small>Planlanan</small>'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${extraRows.length?`<button type="button" class="bs-installment-toggle" aria-expanded="false">Tüm ${rows.length} taksiti göster</button>`:''}
    `;

    const grid=content.querySelector('.detail-grid');
    const actions=content.querySelector('.detail-actions');
    if(actions) actions.insertAdjacentElement('beforebegin',section);
    else if(grid) grid.insertAdjacentElement('afterend',section);
    else content.appendChild(section);

    const toggle=section.querySelector('.bs-installment-toggle');
    if(toggle){
      toggle.addEventListener('click',()=>{
        const expanded=toggle.getAttribute('aria-expanded')==='true';
        section.querySelectorAll('[data-extra-installment]').forEach(row=>row.hidden=expanded);
        toggle.setAttribute('aria-expanded',expanded?'false':'true');
        toggle.textContent=expanded?`Tüm ${rows.length} taksiti göster`:'İlk 6 taksiti göster';
      });
    }
  }

  function enhanceDebtDetail(record){
    const next=configuredNextPayment(record);
    const d=normalizeDebt(record);
    const content=document.querySelector('#detailContent');
    if(!content) return;

    if(next>EPS){
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

    renderInstallmentPlan(d,content);
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
    ensureStyles();
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