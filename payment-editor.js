/* BS OFİS BÜTÇE V2.3.8 - Ödeme düzenleme / güvenli silme */
(() => {
  if(window.__bsPaymentEditorV238Loaded) return;
  window.__bsPaymentEditorV238Loaded=true;

  const EPS=.005;
  const roundMoney=n=>Math.round((+n||0)*100)/100;
  const MUTABLE_DEBT_CUSTOM=[
    'remaining_installments',
    'current_installment_paid',
    'next_payment_after_current',
    'next_payment_source',
    'balance_source'
  ];
  const DERIVED_PAYMENT_KEYS=[
    'payment_plan_v2','payment_plan_v3','payment_status',
    'installment_due_date','installment_amount_at_payment',
    'installment_paid_before','installment_remaining_before',
    'installment_remaining_after','completed_installments','unapplied_amount',
    'debt_balance_v1','debt_balance_tracked','debt_balance_source',
    'debt_balance_before','debt_balance_after','debt_balance_applied',
    'debt_balance_unapplied_amount','payment_undo_v238'
  ];

  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);

  function paymentCustom(raw){
    return {...(raw?.custom||raw?.ozel_alanlar||{})};
  }

  function captureUndo(rawDebt){
    const d=normalizeDebt(rawDebt);
    const c=d.custom||{};
    const values={};
    const present=[];

    MUTABLE_DEBT_CUSTOM.forEach(k=>{
      if(own(c,k)){
        present.push(k);
        values[k]=clone(c[k]);
      }
    });

    return {
      version:1,
      minimum:roundMoney(d.minimum),
      dueDate:d.dueDate||'',
      balance:roundMoney(d.balance),
      status:d.status||'active',
      customPresent:present,
      customValues:values
    };
  }

  function restoreUndo(rawDebt,snap){
    const d=normalizeDebt(rawDebt);
    const custom={...(d.custom||{})};
    MUTABLE_DEBT_CUSTOM.forEach(k=>delete custom[k]);
    (snap.customPresent||[]).forEach(k=>{
      if(own(snap.customValues,k)) custom[k]=clone(snap.customValues[k]);
    });

    d.minimum=roundMoney(snap.minimum);
    d.dueDate=snap.dueDate||'';
    d.balance=Math.max(0,roundMoney(snap.balance));
    d.status=snap.status||'active';
    d.custom=custom;
    d.updatedAt=new Date().toISOString();
    return d;
  }

  function cleanDerivedPayment(rawPayment){
    const p=normalizePayment(rawPayment);
    const custom={...(p.custom||{})};
    DERIVED_PAYMENT_KEYS.forEach(k=>delete custom[k]);
    p.custom=custom;
    return p;
  }

  function reversible(rawPayment){
    const c=paymentCustom(rawPayment);
    return !!(
      c.payment_undo_v238?.version===1 ||
      c.payment_plan_v3 ||
      c.payment_plan_v2
    );
  }

  function rollbackFromMetadata(rawDebt,rawPayment){
    const p=normalizePayment(rawPayment);
    const meta=p.custom||{};

    if(meta.payment_undo_v238?.version===1){
      return restoreUndo(rawDebt,meta.payment_undo_v238);
    }

    if(!reversible(p)){
      throw new Error('Bu eski ödeme güvenli geri alma bilgisi taşımıyor. Taksit planını bozmamak için otomatik silme/düzenleme durduruldu.');
    }

    const d=normalizeDebt(rawDebt);
    const custom={...(d.custom||{})};
    const completed=Math.max(0,+meta.completed_installments||0);
    const afterMinimum=Math.max(0,+d.minimum||0);
    const beforeMinimum=Math.max(0,+meta.installment_amount_at_payment||0);
    const paidBefore=Math.max(0,+meta.installment_paid_before||0);

    if(
      custom.remaining_installments!=='' &&
      custom.remaining_installments!=null &&
      !Number.isNaN(+custom.remaining_installments)
    ){
      custom.remaining_installments=Math.max(0,+custom.remaining_installments)+completed;
    }

    if(paidBefore>EPS) custom.current_installment_paid=roundMoney(paidBefore);
    else delete custom.current_installment_paid;

    if(completed>0 && afterMinimum>EPS){
      custom.next_payment_after_current=roundMoney(afterMinimum);
      custom.next_payment_source='payment_rollback_v238';
    }

    if(meta.debt_balance_tracked===true && Number.isFinite(+meta.debt_balance_before)){
      d.balance=Math.max(0,roundMoney(meta.debt_balance_before));
      custom.balance_source=meta.debt_balance_source==='plan'?'taksit_plani_v222':'kayitli';
    }

    d.minimum=roundMoney(beforeMinimum);
    if(own(meta,'installment_due_date')) d.dueDate=meta.installment_due_date||'';
    d.status='active';
    d.custom=custom;
    d.updatedAt=new Date().toISOString();
    return d;
  }

  function paymentOrderForDebt(debtId){
    return state.payments
      .map((raw,index)=>({
        raw,
        p:normalizePayment(raw),
        index,
        created:String(raw?.createdAt??raw?.olusturma_zamani??'')
      }))
      .filter(x=>x.p.debtId===debtId)
      .sort((a,b)=>a.created.localeCompare(b.created)||a.index-b.index);
  }

  function buildRecalculation(targetId,replacement=null){
    const target=state.payments.map(normalizePayment).find(p=>p.id===targetId);
    if(!target) throw new Error('Ödeme kaydı bulunamadı.');

    const rawDebt=state.debts.find(x=>normalizeDebt(x).id===target.debtId);
    if(!rawDebt) throw new Error('Ödemenin bağlı olduğu borç bulunamadı.');

    const ordered=paymentOrderForDebt(target.debtId);
    const pos=ordered.findIndex(x=>x.p.id===targetId);
    if(pos<0) throw new Error('Ödeme sırası belirlenemedi.');

    const affected=ordered.slice(pos);
    const unsupported=affected.find(x=>!reversible(x.raw));
    if(unsupported){
      throw new Error('Bu ödeme veya sonrasındaki eski bir ödeme güvenli geri alma bilgisi taşımıyor. Finansal planın bozulmaması için işlem yapılmadı.');
    }

    let debt=normalizeDebt(clone(rawDebt));
    for(let i=affected.length-1;i>=0;i--){
      debt=rollbackFromMetadata(debt,affected[i].raw);
    }

    const updatedPayments=[];
    affected.forEach((entry,i)=>{
      if(i===0 && !replacement) return;
      const source=i===0?replacement:entry.raw;
      const p=cleanDerivedPayment(clone(source));
      applyPaymentPlan(debt,p.date,p.amount,p);
      updatedPayments.push(normalizePayment(p));
    });

    return {
      originalDebt:normalizeDebt(clone(rawDebt)),
      affectedOriginals:affected.map(x=>normalizePayment(clone(x.raw))),
      updatedDebt:normalizeDebt(debt),
      updatedPayments
    };
  }

  function applyLocalResult(result,targetId,deleting){
    const debtIndex=state.debts.findIndex(x=>normalizeDebt(x).id===result.updatedDebt.id);
    if(debtIndex>=0) state.debts[debtIndex]=normalizeDebt(result.updatedDebt);

    const updated=new Map(result.updatedPayments.map(p=>[p.id,p]));
    state.payments=state.payments
      .filter(raw=>!(deleting && normalizePayment(raw).id===targetId))
      .map(raw=>updated.get(normalizePayment(raw).id)||raw);

    saveState();
  }

  async function applyCloudResult(result,targetId,deleting){
    const originals=result.affectedOriginals.map(p=>normalizePayment(clone(p)));
    const originalDebt=normalizeDebt(clone(result.originalDebt));
    let operationError=null;

    syncing=true;
    try{
      for(const p of result.updatedPayments) await cloudUpsertPayment(normalizePayment(p));
      await cloudUpsertDebt(normalizeDebt(result.updatedDebt));
      if(deleting) await deleteCloud('odemeler',targetId);
    }catch(e){
      operationError=e;
      try{
        await cloudUpsertDebt(originalDebt);
        for(const p of originals) await cloudUpsertPayment(p);
      }catch(rollbackError){
        console.error('Ödeme işlemi geri alma hatası:',rollbackError);
      }
    }finally{
      syncing=false;
    }

    try{await pullCloud();}catch(_e){}
    if(operationError) throw operationError;
  }

  async function simplePaymentUpdate(updated){
    if(session){
      syncing=true;
      try{
        await cloudUpsertPayment(updated);
      }finally{
        syncing=false;
      }
      await pullCloud();
      return;
    }

    const i=state.payments.findIndex(x=>normalizePayment(x).id===updated.id);
    if(i>=0) state.payments[i]=updated;
    saveState();
  }

  function ensureEditDebtOption(payment){
    const select=document.querySelector('#recordForm [name="debtId"]');
    if(!select) return;
    const debt=state.debts.map(normalizeDebt).find(d=>d.id===payment.debtId);
    if(![...select.options].some(o=>o.value===payment.debtId)){
      const o=document.createElement('option');
      o.value=payment.debtId;
      o.textContent=debt?.name||'Mevcut borç';
      select.appendChild(o);
    }
    select.value=payment.debtId;
    select.tabIndex=-1;
    select.setAttribute('aria-readonly','true');
    select.style.pointerEvents='none';
    select.style.background='#f8fafc';
    select.style.color='#64748b';

    const label=select.closest('label');
    if(label && !label.querySelector('.bs-payment-debt-lock')){
      const hint=document.createElement('small');
      hint.className='bs-payment-debt-lock';
      hint.textContent='Bağlı borç değiştirilemez. Yanlış borç seçildiyse ödemeyi silip doğru borca yeniden girin.';
      hint.style.cssText='display:block;margin-top:5px;color:#64748b;font-size:10px;line-height:1.35';
      label.appendChild(hint);
    }
  }

  function openPaymentEdit(payment){
    document.querySelector('#detailDialog')?.close();
    openRecordDialog('payments',payment);
    const title=document.querySelector('#recordDialogTitle');
    if(title) title.textContent='Ödemeyi Düzenle';
    ensureEditDebtOption(payment);
  }

  async function deletePayment(paymentId,button=null){
    const p=state.payments.map(normalizePayment).find(x=>x.id===paymentId);
    if(!p) return;
    if(!confirm('Bu ödeme silinsin mi? Borç bakiyesi ve taksit planı ödeme yapılmadan önceki duruma göre yeniden hesaplanacak.')) return;

    if(button){button.disabled=true;button.textContent='Siliniyor…';}
    try{
      const result=buildRecalculation(paymentId,null);
      if(session) await applyCloudResult(result,paymentId,true);
      else applyLocalResult(result,paymentId,true);
      document.querySelector('#detailDialog')?.close();
      toast('Ödeme silindi; borç planı yeniden hesaplandı.');
    }catch(e){
      alert(`Ödeme silinemedi: ${e.message}`);
      if(button){button.disabled=false;button.textContent='Sil';}
    }
  }

  function installPaymentDetailActions(){
    if(typeof showDetail!=='function' || showDetail.__bsPaymentEditorV238) return;
    const originalShowDetailV238=showDetail;
    const wrapped=function(module,record){
      const result=originalShowDetailV238(module,record);
      if(module==='payments'){
        const actions=document.querySelector('#detailContent .detail-actions');
        if(actions){
          actions.innerHTML=`
            <button type="button" class="secondary" data-v238-payment-edit="${esc(record.id)}">Düzenle</button>
            <button type="button" class="danger-btn" data-v238-payment-delete="${esc(record.id)}">Sil</button>
          `;
        }
      }
      return result;
    };
    wrapped.__bsPaymentEditorV238=true;
    showDetail=wrapped;
  }

  function installUndoCapture(){
    if(typeof applyPaymentPlan!=='function' || applyPaymentPlan.__bsPaymentUndoV238) return;
    const originalApplyPaymentPlanV238=applyPaymentPlan;
    const wrapped=function(raw,paymentDate,explicitAmount=null,paymentRecord=null){
      let target=paymentRecord;
      if(!target && explicitAmount==null && raw){
        const debtId=normalizeDebt(raw).id;
        for(let i=state.payments.length-1;i>=0;i--){
          const p=normalizePayment(state.payments[i]);
          if(p.debtId===debtId && p.date===paymentDate){target=state.payments[i];break;}
        }
      }

      if(target){
        const custom=paymentCustom(target);
        if(!custom.payment_undo_v238){
          custom.payment_undo_v238=captureUndo(raw);
          target.custom=custom;
        }
      }

      return originalApplyPaymentPlanV238(raw,paymentDate,explicitAmount,paymentRecord||target);
    };
    wrapped.__bsPaymentUndoV238=true;
    applyPaymentPlan=wrapped;
  }

  function installEvents(){
    if(window.__bsPaymentEditorV238Events) return;
    window.__bsPaymentEditorV238Events=true;

    document.addEventListener('click',e=>{
      const edit=e.target.closest('[data-v238-payment-edit]');
      if(edit){
        e.preventDefault();
        e.stopPropagation();
        const p=state.payments.map(normalizePayment).find(x=>x.id===edit.dataset.v238PaymentEdit);
        if(p) openPaymentEdit(p);
        return;
      }

      const del=e.target.closest('[data-v238-payment-delete]');
      if(del){
        e.preventDefault();
        e.stopPropagation();
        deletePayment(del.dataset.v238PaymentDelete,del);
      }
    },true);

    const form=document.querySelector('#recordForm');
    if(form){
      form.addEventListener('submit',async e=>{
        const module=form.querySelector('[name="module"]')?.value;
        const id=form.querySelector('[name="id"]')?.value;
        if(module!=='payments' || !id) return;

        const target=state.payments.map(normalizePayment).find(x=>x.id===id);
        if(!target) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        const fd=Object.fromEntries(new FormData(form));
        const amount=roundMoney(fd.amount);
        if(amount<=0){toast('Ödeme tutarı sıfırdan büyük olmalı.');return;}
        if(fd.debtId && fd.debtId!==target.debtId){toast('Ödemenin bağlı olduğu borç değiştirilemez.');return;}

        const submit=form.querySelector('button[type="submit"]');
        const oldText=submit?.textContent||'Kaydet';
        if(submit){submit.disabled=true;submit.textContent='Kaydediliyor…';}

        try{
          const custom=parseCustomValues(fd,'payments',target.custom||{});
          const sameAmount=Math.abs(amount-target.amount)<=EPS;

          if(sameAmount){
            const updated=normalizePayment({
              ...target,
              date:fd.date,
              amount,
              notes:fd.notes||'',
              custom
            });
            await simplePaymentUpdate(updated);
          }else{
            const replacement=normalizePayment({
              ...target,
              date:fd.date,
              amount,
              notes:fd.notes||'',
              custom,
              debtId:target.debtId
            });
            const result=buildRecalculation(id,replacement);
            if(session) await applyCloudResult(result,id,false);
            else applyLocalResult(result,id,false);
          }

          document.querySelector('#recordDialog')?.close();
          toast(sameAmount?'Ödeme güncellendi.':'Ödeme güncellendi; borç planı yeniden hesaplandı.');
        }catch(err){
          alert(`Ödeme güncellenemedi: ${err.message}`);
          if(submit){submit.disabled=false;submit.textContent=oldText;}
        }
      },true);
    }
  }

  function install(){
    if(
      !window.__bsPaymentPlanV3Loaded ||
      !window.__bsDebtBalanceV236Installed ||
      typeof applyPaymentPlan!=='function'
    ){
      setTimeout(install,80);
      return;
    }
    installUndoCapture();
    installPaymentDetailActions();
    installEvents();
    try{renderDashboard();renderPayments();}catch(_e){}
  }

  install();
})();
