/* BS OFİS BÜTÇE V2.2.4 - Genel kesin taksit planı motoru */
(() => {
  if(window.__bsExactScheduleV224Loaded) return;
  window.__bsExactScheduleV224Loaded=true;

  const EPS=.005;
  const PREVIEW_LIMIT=6;
  const roundMoney=n=>Math.round((+n||0)*100)/100;

  function installmentPaid(raw){
    const d=normalizeDebt(raw);
    return Math.max(0,+(d.custom?.current_installment_paid||0));
  }

  function exactSchedule(raw){
    const d=normalizeDebt(raw);
    const arr=d.custom?.installment_schedule;
    if(!Array.isArray(arr) || !arr.length) return [];

    return arr
      .map(x=>({
        date:String(x?.date||''),
        amount:roundMoney(x?.amount)
      }))
      .filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date) && x.amount>EPS)
      .sort((a,b)=>a.date.localeCompare(b.date));
  }

  function exactSummary(raw){
    const d=normalizeDebt(raw);
    const schedule=exactSchedule(d);
    if(!schedule.length) return null;

    if(d.status==='closed'){
      return {
        kind:'exact',safe:true,total:0,rows:[],schedule,
        recordedCount:0,calculatedCount:0,mismatch:false
      };
    }

    const remRaw=d.custom?.remaining_installments;
    const hasCount=remRaw!=='' && remRaw!=null && !Number.isNaN(+remRaw);
    const recordedCount=hasCount
      ?Math.max(0,Math.floor(+remRaw))
      :schedule.length;

    const mismatch=recordedCount>schedule.length;
    const offset=mismatch?0:Math.max(0,schedule.length-recordedCount);
    const paid=installmentPaid(d);

    const rows=schedule.slice(offset).map((item,i)=>{
      const isCurrent=i===0;
      const planned=item.amount;
      const amount=isCurrent
        ?Math.max(0,roundMoney(planned-paid))
        :planned;

      return {
        index:i+1,
        isCurrent,
        date:item.date,
        amount,
        planned,
        paid:isCurrent?paid:0,
        exact:true
      };
    }).filter(x=>x.amount>EPS);

    return {
      kind:'exact',
      safe:!mismatch,
      total:roundMoney(rows.reduce((s,row)=>s+row.amount,0)),
      rows,
      schedule,
      recordedCount,
      calculatedCount:rows.length,
      mismatch
    };
  }

  const previousSummary=typeof window.bsDebtPlanSummary==='function'
    ?window.bsDebtPlanSummary
    :null;

  if(previousSummary){
    window.bsDebtPlanSummary=function(raw){
      return exactSummary(raw)||previousSummary(raw);
    };
    window.bsDebtInstallmentPlan=raw=>window.bsDebtPlanSummary(raw)?.rows||[];
  }

  if(typeof applyPaymentPlan==='function' && !applyPaymentPlan.__bsExactScheduleV224){
    const originalApplyPaymentPlanV224=applyPaymentPlan;

    const wrapped=function(raw,paymentDate,explicitAmount=null,paymentRecord=null){
      const before=exactSummary(raw);

      if(before?.safe && before.rows.length>1){
        const custom={...(raw.custom||raw.ozel_alanlar||{})};
        custom.next_payment_after_current=roundMoney(before.rows[1].planned);
        custom.next_payment_source='exact_schedule_v224';
        raw.custom=custom;
      }

      const result=originalApplyPaymentPlanV224(
        raw,
        paymentDate,
        explicitAmount,
        paymentRecord
      );

      const after=exactSummary(raw);
      if(after?.kind==='exact'){
        if(after.rows.length){
          raw.dueDate=after.rows[0].date;
          raw.minimum=roundMoney(after.rows[0].planned);
          raw.status='active';
        }else if(after.recordedCount===0){
          raw.status='closed';
        }
        raw.updatedAt=new Date().toISOString();
      }

      return result;
    };

    wrapped.__bsExactScheduleV224=true;
    applyPaymentPlan=wrapped;
  }

  function planLabel(record){
    const d=normalizeDebt(record);
    return String(
      d.custom?.installment_schedule_label
      ||d.custom?.installment_schedule_provider
      ||'Kesin Taksit Planı'
    );
  }

  function renderExactPlan(record,content){
    const summary=exactSummary(record);
    if(!summary?.rows?.length || !content) return;

    content.querySelector('.bs-installment-plan')?.remove();
    content.querySelector('.bs-plan-total-row')?.remove();
    content.querySelector('.bs-next-payment-row')?.remove();

    const rows=summary.rows;
    const extraRows=rows.slice(PREVIEW_LIMIT);
    const label=planLabel(record);

    const section=document.createElement('section');
    section.className='bs-installment-plan bs-exact-bank-plan';
    section.innerHTML=`
      <div class="bs-installment-plan-head">
        <div>
          <strong>Kesin Taksit Planı</strong>
          <small>${esc(label)} · kayıtlı gerçek ödeme tarihleri · toplam ${money(summary.total)}</small>
        </div>
        <span class="bs-installment-count">${summary.recordedCount} ödeme kaldı</span>
      </div>
      ${summary.mismatch?`<div class="bs-plan-warning">Plan kontrolü gerekli: kayıtlı kalan ödeme sayısı kesin plan satırlarından fazla.</div>`:''}
      <div class="bs-installment-list">
        ${rows.map((row,i)=>{
          const dateText=parseDate(row.date).toLocaleDateString('tr-TR',{
            day:'2-digit',month:'short',year:'numeric'
          });
          const partial=row.isCurrent && row.paid>EPS;

          return `
            <div class="bs-installment-row" ${i>=PREVIEW_LIMIT?'hidden data-extra-installment="1"':''}>
              <div class="bs-installment-main">
                <strong>${row.isCurrent?'Mevcut ödeme':`${row.index}. ödeme`}${row.isCurrent?'<span class="bs-installment-current">Sıradaki</span>':''}</strong>
                <small>${dateText}${partial?` · Plan ${money(row.planned)}`:''}</small>
              </div>
              <div class="bs-installment-amount">
                <strong>${money(row.amount)}</strong>
                ${partial?'<small>Kalan tutar</small>':'<small>Planlanan</small>'}
              </div>
            </div>`;
        }).join('')}
      </div>
      ${extraRows.length?`<button type="button" class="bs-installment-toggle" aria-expanded="false">Tüm ${rows.length} ödemeyi göster</button>`:''}
    `;

    const actions=content.querySelector('.detail-actions');
    const grid=content.querySelector('.detail-grid');
    if(actions) actions.insertAdjacentElement('beforebegin',section);
    else if(grid) grid.insertAdjacentElement('afterend',section);
    else content.appendChild(section);

    const toggle=section.querySelector('.bs-installment-toggle');
    if(toggle){
      toggle.addEventListener('click',()=>{
        const expanded=toggle.getAttribute('aria-expanded')==='true';
        section.querySelectorAll('[data-extra-installment]').forEach(row=>{
          row.hidden=expanded;
        });
        toggle.setAttribute('aria-expanded',expanded?'false':'true');
        toggle.textContent=expanded
          ?`Tüm ${rows.length} ödemeyi göster`
          :'İlk 6 ödemeyi göster';
      });
    }
  }

  if(typeof showDetail==='function' && !showDetail.__bsExactScheduleV224){
    const originalShowDetailV224=showDetail;
    const wrapped=function(module,record){
      originalShowDetailV224(module,record);
      if(module==='debts' && exactSchedule(record).length){
        renderExactPlan(record,document.querySelector('#detailContent'));
      }
    };
    wrapped.__bsExactScheduleV224=true;
    showDetail=wrapped;
  }
})();
