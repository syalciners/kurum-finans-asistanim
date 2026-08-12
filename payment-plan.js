/* BS OFİS BÜTÇE - Kısmi ödeme / taksit planı V2.1 */
(() => {
  // Dinamik UI modülleri paralel yüklenebildiği için bu modül en son devreye girer.
  // Böylece v179 veya güncel ui.js paymentCard/debtCard davranışını sonradan ezemez.
  if(!window.__bsOfisV179Loaded || !document.querySelector('#bsCurrentUiStyles')){
    if(!window.__bsPaymentPlanV2Waiting){
      window.__bsPaymentPlanV2Waiting=true;
      const retry=()=>{
        if(window.__bsOfisV179Loaded && document.querySelector('#bsCurrentUiStyles')){
          window.__bsPaymentPlanV2Waiting=false;
          const script=document.createElement('script');
          script.src='payment-plan.js?v=193&final=1';
          script.dataset.paymentPlanFinal='1';
          document.head.appendChild(script);
          return;
        }
        setTimeout(retry,80);
      };
      setTimeout(retry,80);
    }
    return;
  }

  if(window.__bsPaymentPlanV2Loaded) return;
  window.__bsPaymentPlanV2Loaded=true;

  const EPS=.005;
  const roundMoney=n=>Math.round((+n||0)*100)/100;

  function debtCustom(d){
    return {...(d?.custom||d?.ozel_alanlar||{})};
  }

  function installmentPaid(d){
    const x=normalizeDebt(d);
    return Math.max(0,+x.custom?.current_installment_paid||0);
  }

  function currentInstallmentRemaining(d){
    const x=normalizeDebt(d);
    const planned=Math.max(0,+x.minimum||0);
    if(planned<=0) return 0;
    return Math.max(0,roundMoney(planned-installmentPaid(x)));
  }

  window.currentInstallmentRemaining=currentInstallmentRemaining;

  // Takvimde tam taksit yerine, kısmi ödeme sonrası gerçekten kalan tutarı göster.
  dueItems=function(){
    const now=parseDate(todayISO());

    return activeDebts()
      .filter(d=>d.dueDate)
      .map(d=>{
        const date=parseDate(d.dueDate);
        return {
          ...d,
          date,
          days:daysBetween(now,date),
          amount:currentInstallmentRemaining(d),
          installmentPaid:installmentPaid(d),
          installmentPlanned:+d.minimum||0
        };
      })
      .filter(d=>d.amount>EPS || (+d.minimum||0)<=0)
      .sort((a,b)=>a.date-b.date);
  };

  function resolveLatestLocalPayment(debtId,paymentDate){
    for(let i=state.payments.length-1;i>=0;i--){
      const p=normalizePayment(state.payments[i]);
      if(p.debtId===debtId && p.date===paymentDate){
        return state.payments[i];
      }
    }
    return null;
  }

  function decoratePaymentRecord(paymentRecord,meta){
    if(!paymentRecord) return;
    const custom={...(paymentRecord.custom||paymentRecord.ozel_alanlar||{})};
    Object.assign(custom,meta,{payment_plan_v2:true});
    paymentRecord.custom=custom;
  }

  // Eski applyPaymentPlan her ödeme kaydında taksit sayısını azaltıp vadeyi ilerletiyordu.
  // Yeni sürüm yalnız mevcut taksit tamamen ödendiğinde planı ilerletir.
  applyPaymentPlan=function(raw,paymentDate,explicitAmount=null,paymentRecord=null){
    if(!raw) return raw;

    const before=normalizeDebt(raw);
    const custom=debtCustom(before);

    let rawPayment=paymentRecord;
    if(!rawPayment && explicitAmount==null){
      rawPayment=resolveLatestLocalPayment(before.id,paymentDate);
    }

    const amount=roundMoney(
      explicitAmount!=null
        ?explicitAmount
        :rawPayment
          ?normalizePayment(rawPayment).amount
          :0
    );

    if(amount<=0) return raw;

    let installment=Math.max(0,+before.minimum||0);
    let paidBefore=Math.max(0,+custom.current_installment_paid||0);
    let dueDate=before.dueDate||'';
    let left=amount;
    let completed=0;

    const remRaw=custom.remaining_installments;
    const hasRemainingCount=
      remRaw!=='' && remRaw!=null && !Number.isNaN(+remRaw);
    let remainingCount=hasRemainingCount?Math.max(0,+remRaw):null;

    const originalDueDate=dueDate;
    const originalInstallment=installment;
    const originalPaid=paidBefore;
    const originalRemaining=Math.max(0,roundMoney(installment-paidBefore));

    if(installment>EPS){
      let guard=0;
      while(left>EPS && guard<120){
        guard++;

        const dueNow=Math.max(0,roundMoney(installment-paidBefore));
        if(dueNow<=EPS){
          paidBefore=0;
        }else{
          const applied=Math.min(left,dueNow);
          paidBefore=roundMoney(paidBefore+applied);
          left=roundMoney(left-applied);

          if(paidBefore+EPS<installment){
            break;
          }
        }

        // Mevcut taksit tamamlandı.
        paidBefore=0;
        completed++;

        if(hasRemainingCount){
          remainingCount=Math.max(0,remainingCount-1);
          custom.remaining_installments=remainingCount;
        }

        if(before.frequency==='oneoff'){
          remainingCount=0;
          break;
        }

        if(hasRemainingCount && remainingCount<=0){
          break;
        }

        const next=+custom.next_payment_after_current||0;
        if(next>EPS){
          installment=roundMoney(next);
          delete custom.next_payment_after_current;
        }

        if(before.frequency==='monthly' && dueDate){
          dueDate=addMonths(parseDate(dueDate),1)
            .toISOString()
            .slice(0,10);
        }
      }
    }

    if(paidBefore>EPS){
      custom.current_installment_paid=roundMoney(paidBefore);
    }else{
      delete custom.current_installment_paid;
    }

    raw.minimum=installment;
    raw.dueDate=dueDate;
    raw.custom=custom;
    raw.updatedAt=new Date().toISOString();

    if(before.frequency==='oneoff' && completed>0){
      raw.status='closed';
    }else if(hasRemainingCount && remainingCount<=0){
      raw.status='closed';
    }else{
      raw.status='active';
    }

    const finalRemaining=
      raw.status==='closed'
        ?0
        :Math.max(0,roundMoney(installment-paidBefore));

    let paymentStatus='partial';
    if(completed>0 && paidBefore>EPS) paymentStatus='completed_plus_partial';
    else if(completed>0) paymentStatus='completed';

    decoratePaymentRecord(rawPayment,{
      payment_status:paymentStatus,
      installment_due_date:originalDueDate,
      installment_amount_at_payment:originalInstallment,
      installment_paid_before:originalPaid,
      installment_remaining_before:originalRemaining,
      installment_remaining_after:
        completed===0
          ?Math.max(0,roundMoney(originalRemaining-amount))
          :paymentStatus==='completed_plus_partial'
            ?finalRemaining
            :0,
      completed_installments:completed,
      unapplied_amount:Math.max(0,roundMoney(left))
    });

    return raw;
  };

  // Bulutta da aynı hesap kullanılır; ödeme ve borç planı birlikte güncellenir.
  payCloud=async function(debtId,amount,date,notes,custom){
    if(!session) return false;

    const currentRaw=state.debts.find(x=>normalizeDebt(x).id===debtId);
    if(!currentRaw) return false;

    const updatedDebt=clone(currentRaw);
    const payment=normalizePayment({
      id:uid(),
      debtId,
      amount:+amount||0,
      date,
      notes:notes||'',
      custom:custom||{},
      addedBy:deviceName(),
      createdAt:new Date().toISOString()
    });

    applyPaymentPlan(updatedDebt,date,payment.amount,payment);

    try{
      await cloudUpsertPayment(payment);
      try{
        await cloudUpsertDebt(normalizeDebt(updatedDebt));
      }catch(e){
        try{await deleteCloud('odemeler',payment.id);}catch(_rollbackError){}
        throw e;
      }
      await pullCloud();
      return true;
    }catch(e){
      alert(`Ödeme kaydedilemedi: ${e.message}`);
      throw e;
    }
  };

  const originalPaymentCard=paymentCard;
  paymentCard=function(p){
    const x=normalizePayment(p);
    const meta=x.custom||{};
    if(!meta.payment_plan_v2) return originalPaymentCard(x);

    const d=state.debts.map(normalizeDebt).find(v=>v.id===x.debtId);
    const status=meta.payment_status;

    let statusHtml='';
    if(status==='partial'){
      statusHtml=` · <span class="badge orange">Kısmi ödeme</span>`;
    }else if(status==='completed_plus_partial'){
      statusHtml=` · <span class="badge green">Taksit ödendi</span>`;
    }else if(status==='completed'){
      statusHtml=` · <span class="badge green">Taksit ödendi</span>`;
    }

    let secondLine='';
    if(status==='partial'){
      secondLine=`<small>Kalan taksit ${money(meta.installment_remaining_after||0)}</small>`;
    }else if(status==='completed_plus_partial'){
      secondLine=`<small>Sonraki taksitte kalan ${money(meta.installment_remaining_after||0)}</small>`;
    }

    return `
      <article class="list-card clickable v179-payment-card" data-payment="${esc(x.id)}">
        <div class="main">
          <strong>${esc(d?.name||'Silinmiş borç')}</strong>
          <small>
            ${parseDate(x.date).toLocaleDateString('tr-TR')}
            ${x.addedBy?` · ${esc(x.addedBy)}`:''}
            ${statusHtml}
          </small>
          ${secondLine}
        </div>
        <div class="amount">${money(x.amount)}</div>
      </article>
    `;
  };

  const originalDebtCard=debtCard;
  debtCard=function(d){
    const x=normalizeDebt(d);
    const paid=installmentPaid(x);
    if(paid<=EPS) return originalDebtCard(x);

    const owner=x.custom?.debt_owner||'';
    const rem=x.custom?.remaining_installments;
    const left=rem!==''&&rem!=null?`${fmt(rem)} taksit`:'';
    const remaining=currentInstallmentRemaining(x);

    return `
      <article class="list-card clickable" data-debt="${x.id}">
        <div class="main">
          <strong>${esc(x.name)}</strong>
          <small>
            ${owner?`${esc(owner)} · `:''}${esc(x.type)}${left?` · ${esc(left)}`:''}
            · <span class="badge orange">Kısmi</span>
          </small>
          <small>${money(paid)} ödendi · bu taksitte ${money(remaining)} kaldı</small>
        </div>
        <div class="amount">
          ${remaining>0?money(remaining):'Tamamlandı'}
          <small>${x.dueDate?parseDate(x.dueDate).toLocaleDateString('tr-TR'):'Tarih girilmedi'}</small>
        </div>
      </article>
    `;
  };

  function enhancePaymentForm(){
    const form=document.querySelector('#recordForm');
    if(!form) return;
    const module=form.querySelector('[name="module"]')?.value;
    if(module!=='payments') return;

    const debtSelect=form.querySelector('[name="debtId"]');
    const amountInput=form.querySelector('[name="amount"]');
    if(!debtSelect||!amountInput) return;

    let hint=document.querySelector('#bsPartialPaymentHint');
    if(!hint){
      hint=document.createElement('div');
      hint.id='bsPartialPaymentHint';
      hint.style.cssText='margin:-5px 0 2px;padding:9px 10px;border-radius:11px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;font-size:11px;line-height:1.35';
      amountInput.closest('label')?.insertAdjacentElement('afterend',hint);
    }

    const update=()=>{
      const d=state.debts.map(normalizeDebt).find(x=>x.id===debtSelect.value);
      if(!d){hint.textContent='Ödeme yapılacak borcu seçin.';return;}

      const remaining=currentInstallmentRemaining(d);
      const paid=installmentPaid(d);
      const entered=Math.max(0,+amountInput.value||0);

      if((+d.minimum||0)<=0){
        hint.textContent='Bu borç için planlı taksit tutarı tanımlanmamış.';
        return;
      }

      if(entered<=0){
        hint.textContent=paid>0
          ?`Bu taksit ${money(d.minimum)} · daha önce ${money(paid)} ödendi · kalan ${money(remaining)}.`
          :`Bu taksit için kalan tutar ${money(remaining)}.`;
        return;
      }

      if(entered+EPS<remaining){
        hint.innerHTML=`<strong style="color:#c97800">Kısmi ödeme</strong> · Bu işlemden sonra aynı taksitte ${money(remaining-entered)} kalacak.`;
      }else if(Math.abs(entered-remaining)<=EPS){
        hint.innerHTML=`<strong style="color:#168a42">Taksit tamamlanacak</strong> · Sonraki vade ancak kayıt tamamlandığında açılacak.`;
      }else{
        hint.innerHTML=`<strong style="color:#2563eb">Fazla ödeme</strong> · Mevcut taksit kapanır; kalan ${money(entered-remaining)} sonraki taksite aktarılır.`;
      }
    };

    debtSelect.onchange=update;
    amountInput.oninput=update;
    update();
  }

  if(typeof openRecordDialog==='function' && !openRecordDialog.__bsPartialWrapped){
    const originalOpenRecordDialog=openRecordDialog;
    const wrapped=function(module,record=null){
      originalOpenRecordDialog(module,record);
      if(module==='payments') setTimeout(enhancePaymentForm,0);
    };
    wrapped.__bsPartialWrapped=true;
    openRecordDialog=wrapped;
  }

  // Modül sonradan yüklendiğinde açık bir ödeme formu varsa hemen geliştir.
  setTimeout(enhancePaymentForm,0);

  // Yeni dueItems / kart görünümü ekrana hemen yansısın.
  try{
    renderDashboard();
    renderDebts();
    renderPayments();
    renderCalendar();
  }catch(_e){}
})();