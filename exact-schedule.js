/* BS OFİS BÜTÇE V2.2.3 - Kesin banka taksit planı */
(() => {
  if(window.__bsExactScheduleV223Loaded) return;
  window.__bsExactScheduleV223Loaded=true;

  const EPS=.005;
  const PREVIEW_LIMIT=6;
  const SOURCE='worldcard_banka_ekranlari_2026_08_13_v1';

  const YAPI_KREDI_SCHEDULE=[
    {date:'2026-08-31',amount:5714.93},
    {date:'2026-09-30',amount:5714.99},
    {date:'2026-10-30',amount:5714.99},
    {date:'2026-11-30',amount:5714.99},
    {date:'2026-12-30',amount:5714.99},
    {date:'2027-02-01',amount:5714.99},
    {date:'2027-03-03',amount:5714.99},
    {date:'2027-03-31',amount:5714.99},
    {date:'2027-04-30',amount:5714.99},
    {date:'2027-05-31',amount:3895.93},
    {date:'2027-06-30',amount:3895.93},
    {date:'2027-07-30',amount:3895.93},
    {date:'2027-08-31',amount:3895.93},
    {date:'2027-09-30',amount:3895.93},
    {date:'2027-11-01',amount:3895.93},
    {date:'2027-12-01',amount:3895.93},
    {date:'2027-12-30',amount:3895.93},
    {date:'2028-01-31',amount:3895.93},
    {date:'2028-03-01',amount:3895.93},
    {date:'2028-03-30',amount:3895.93},
    {date:'2028-05-02',amount:3895.93},
    {date:'2028-05-31',amount:3895.93},
    {date:'2028-06-30',amount:3895.93},
    {date:'2028-07-31',amount:3895.93},
    {date:'2028-08-31',amount:3895.93},
    {date:'2028-10-02',amount:3895.93},
    {date:'2028-10-30',amount:3895.93},
    {date:'2028-11-30',amount:3895.93},
    {date:'2029-01-02',amount:3895.93},
    {date:'2029-01-31',amount:3895.93},
    {date:'2029-03-02',amount:3895.93},
    {date:'2029-03-30',amount:3895.93},
    {date:'2029-04-30',amount:3895.93},
    {date:'2029-05-30',amount:3895.93},
    {date:'2029-07-02',amount:3895.93},
    {date:'2029-07-30',amount:3896.02}
  ];

  const roundMoney=n=>Math.round((+n||0)*100)/100;
  const scheduleTotal=arr=>roundMoney(arr.reduce((s,x)=>s+(+x.amount||0),0));

  function installmentPaid(raw){
    const d=normalizeDebt(raw);
    return Math.max(0,+(d.custom?.current_installment_paid||0));
  }

  function exactSchedule(raw){
    const d=normalizeDebt(raw);
    const arr=d.custom?.installment_schedule;
    if(!Array.isArray(arr) || !arr.length) return [];

    return arr
      .map(x=>({date:String(x?.date||''),amount:roundMoney(x?.amount)}))
      .filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date) && x.amount>EPS);
  }

  function exactSummary(raw){
    const d=normalizeDebt(raw);
    const schedule=exactSchedule(d);
    if(!schedule.length) return null;

    if(d.status==='closed'){
      return {kind:'exact',safe:true,total:0,rows:[],recordedCount:0,calculatedCount:0,mismatch:false,schedule};
    }

    const remRaw=d.custom?.remaining_installments;
    const hasCount=remRaw!=='' && remRaw!=null && !Number.isNaN(+remRaw);
    const recordedCount=hasCount?Math.max(0,Math.floor(+remRaw)):schedule.length;
    const mismatch=recordedCount>schedule.length;
    const offset=mismatch?0:Math.max(0,schedule.length-recordedCount);
    const paid=installmentPaid(d);

    const rows=schedule.slice(offset).map((item,i)=>{
      const isCurrent=i===0;
      const planned=item.amount;
      const amount=isCurrent?Math.max(0,roundMoney(planned-paid)):planned;
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

  function isYapiKrediTarget(raw){
    const d=normalizeDebt(raw);
    return d.name.trim()==='Yapı Kredi Bankası Kredi Kartı';
  }

  async function migrateYapiKrediPlan(){
    const raw=state.debts.find(isYapiKrediTarget);
    if(!raw) return false;

    const custom={...(raw.custom||raw.ozel_alanlar||{})};
    if(custom.installment_schedule_source===SOURCE && Array.isArray(custom.installment_schedule) && custom.installment_schedule.length===YAPI_KREDI_SCHEDULE.length){
      return false;
    }

    custom.installment_schedule=YAPI_KREDI_SCHEDULE.map(x=>({...x}));
    custom.installment_schedule_source=SOURCE;
    custom.installment_schedule_total=scheduleTotal(YAPI_KREDI_SCHEDULE);
    custom.remaining_installments=YAPI_KREDI_SCHEDULE.length;
    custom.plan_type='exact_bank_schedule';
    delete custom.next_payment_after_current;
    delete custom.next_payment_source;

    raw.custom=custom;
    raw.minimum=YAPI_KREDI_SCHEDULE[0].amount;
    raw.dueDate=YAPI_KREDI_SCHEDULE[0].date;
    raw.balance=scheduleTotal(YAPI_KREDI_SCHEDULE);
    raw.status='active';
    raw.updatedAt=new Date().toISOString();

    saveState(false);

    if(session){
      try{
        await cloudUpsertDebt(normalizeDebt(raw));
      }catch(e){
        console.warn('Yapı Kredi kesin taksit planı buluta yazılamadı:',e);
      }
    }

    try{renderDashboard();renderDebts();renderCalendar();}catch(_e){}
    return true;
  }

  if(typeof pullCloud==='function' && !pullCloud.__bsExactScheduleV223){
    const originalPullCloudV223=pullCloud;
    const wrapped=async function(...args){
      const result=await originalPullCloudV223(...args);
      await migrateYapiKrediPlan();
      return result;
    };
    wrapped.__bsExactScheduleV223=true;
    pullCloud=wrapped;
  }

  if(typeof applyPaymentPlan==='function' && !applyPaymentPlan.__bsExactScheduleV223){
    const originalApplyPaymentPlanV223=applyPaymentPlan;
    const wrapped=function(raw,paymentDate,explicitAmount=null,paymentRecord=null){
      const before=exactSummary(raw);
      if(before?.safe && before.rows.length>1){
        const custom={...(raw.custom||raw.ozel_alanlar||{})};
        custom.next_payment_after_current=roundMoney(before.rows[1].planned);
        custom.next_payment_source='exact_schedule_v223';
        raw.custom=custom;
      }

      const result=originalApplyPaymentPlanV223(raw,paymentDate,explicitAmount,paymentRecord);
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
    wrapped.__bsExactScheduleV223=true;
    applyPaymentPlan=wrapped;
  }

  function renderExactPlan(record,content){
    const summary=exactSummary(record);
    if(!summary?.rows?.length) return;

    content.querySelector('.bs-installment-plan')?.remove();
    content.querySelector('.bs-plan-total-row')?.remove();
    content.querySelector('.bs-next-payment-row')?.remove();

    const rows=summary.rows;
    const extraRows=rows.slice(PREVIEW_LIMIT);
    const section=document.createElement('section');
    section.className='bs-installment-plan bs-exact-bank-plan';
    section.innerHTML=`
      <div class="bs-installment-plan-head">
        <div>
          <strong>Banka Taksit Planı</strong>
          <small>Yapı Kredi Worldcard · gerçek banka tarihleri · toplam ${money(summary.total)}</small>
        </div>
        <span class="bs-installment-count">${summary.recordedCount} ödeme kaldı</span>
      </div>
      <div class="bs-installment-list">
        ${rows.map((row,i)=>{
          const dateText=parseDate(row.date).toLocaleDateString('tr-TR',{day:'2-digit',month:'short',year:'numeric'});
          const partial=row.isCurrent && row.paid>EPS;
          return `
            <div class="bs-installment-row" ${i>=PREVIEW_LIMIT?'hidden data-extra-installment="1"':''}>
              <div class="bs-installment-main">
                <strong>${row.isCurrent?'Mevcut ödeme':`${row.index}. ödeme`}${row.isCurrent?'<span class="bs-installment-current">Sıradaki</span>':''}</strong>
                <small>${dateText}${partial?` · Plan ${money(row.planned)}`:''}</small>
              </div>
              <div class="bs-installment-amount">
                <strong>${money(row.amount)}</strong>
                ${partial?'<small>Kalan tutar</small>':'<small>Banka planı</small>'}
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
        section.querySelectorAll('[data-extra-installment]').forEach(row=>row.hidden=expanded);
        toggle.setAttribute('aria-expanded',expanded?'false':'true');
        toggle.textContent=expanded?`Tüm ${rows.length} ödemeyi göster`:'İlk 6 ödemeyi göster';
      });
    }
  }

  if(typeof showDetail==='function' && !showDetail.__bsExactScheduleV223){
    const originalShowDetailV223=showDetail;
    const wrapped=function(module,record){
      originalShowDetailV223(module,record);
      if(module==='debts' && exactSchedule(record).length){
        renderExactPlan(record,document.querySelector('#detailContent'));
      }
    };
    wrapped.__bsExactScheduleV223=true;
    showDetail=wrapped;
  }

  setTimeout(migrateYapiKrediPlan,0);
})();
