/* BS OFİS BÜTÇE V2.4.0 - Ödeme düzenleme / silme / hedef başlangıcından güvenli yeniden oynatma */
(() => {
  if(window.__bsPaymentEditorV240Loaded) return;
  window.__bsPaymentEditorV240Loaded=true;

  const EPS=.005;
  const roundMoney=n=>Math.round((+n||0)*100)/100;
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
  const MUTABLE_DEBT_CUSTOM=['remaining_installments','current_installment_paid','next_payment_after_current','next_payment_source','balance_source'];
  const DERIVED_PAYMENT_KEYS=[
    'payment_plan_v2','payment_plan_v3','payment_status','installment_due_date',
    'installment_amount_at_payment','installment_paid_before','installment_remaining_before',
    'installment_remaining_after','completed_installments','unapplied_amount',
    'debt_balance_v1','debt_balance_tracked','debt_balance_source','debt_balance_before',
    'debt_balance_after','debt_balance_applied','debt_balance_unapplied_amount',
    'payment_undo_v238','payment_undo_v239','payment_undo_v240','legacy_latest_undo_v239'
  ];

  function paymentCustom(raw){return {...(raw?.custom||raw?.ozel_alanlar||{})};}

  function captureUndo(rawDebt){
    const d=normalizeDebt(rawDebt),c=d.custom||{},values={},present=[];
    MUTABLE_DEBT_CUSTOM.forEach(k=>{if(own(c,k)){present.push(k);values[k]=clone(c[k]);}});
    return {version:3,minimum:roundMoney(d.minimum),dueDate:d.dueDate||'',balance:roundMoney(d.balance),status:d.status||'active',customPresent:present,customValues:values};
  }

  function undoSnapshot(rawPayment){
    const c=paymentCustom(rawPayment);
    const snap=c.payment_undo_v240||c.payment_undo_v239||c.payment_undo_v238;
    return snap && [1,2,3].includes(+snap.version)?snap:null;
  }

  function restoreUndo(rawDebt,snap){
    const d=normalizeDebt(clone(rawDebt)),custom={...(d.custom||{})};
    MUTABLE_DEBT_CUSTOM.forEach(k=>delete custom[k]);
    (snap.customPresent||[]).forEach(k=>{if(own(snap.customValues,k)) custom[k]=clone(snap.customValues[k]);});
    d.minimum=roundMoney(snap.minimum);d.dueDate=snap.dueDate||'';d.balance=Math.max(0,roundMoney(snap.balance));d.status=snap.status||'active';d.custom=custom;d.updatedAt=new Date().toISOString();
    return d;
  }

  function cleanDerivedPayment(rawPayment){
    const p=normalizePayment(clone(rawPayment)),custom={...(p.custom||{})};
    DERIVED_PAYMENT_KEYS.forEach(k=>delete custom[k]);p.custom=custom;return p;
  }

  function paymentOrderForDebt(debtId){
    return state.payments.map((raw,index)=>({raw,p:normalizePayment(raw),index,created:String(raw?.createdAt??raw?.olusturma_zamani??'')}))
      .filter(x=>x.p.debtId===debtId)
      .sort((a,b)=>String(a.p.date||'').localeCompare(String(b.p.date||''))||a.created.localeCompare(b.created)||a.index-b.index);
  }

  function baselineFromTarget(rawDebt,targetEntry,affected){
    const target=normalizePayment(targetEntry.raw),meta=target.custom||{},snap=undoSnapshot(targetEntry.raw);
    if(snap) return restoreUndo(rawDebt,snap);

    const beforeMinimum=Math.max(0,roundMoney(meta.installment_amount_at_payment));
    const beforeRemaining=Math.max(0,roundMoney(meta.installment_remaining_before));
    const paidBefore=Math.max(0,roundMoney(meta.installment_paid_before));
    const totalAffected=roundMoney(affected.reduce((s,x)=>s+(+x.p.amount||0),0));

    // Eski V4 kayıtlarında hedef ödeme öncesi taksit bilgisi var. Hedef ve sonrasındaki
    // eski kayıtlar aynı taksiti tamamlamadıysa kalan taksit sayısı değişmemiştir;
    // bu nedenle mevcut sayıyı koruyup hedefin kesin başlangıç durumuna dönebiliriz.
    if((meta.payment_plan_v2||meta.payment_plan_v3) && beforeMinimum>EPS && beforeRemaining>EPS && totalAffected<=beforeRemaining+EPS){
      const d=normalizeDebt(clone(rawDebt)),custom={...(d.custom||{})};
      d.minimum=beforeMinimum;
      d.dueDate=meta.installment_due_date||d.dueDate||'';
      d.status='active';
      if(paidBefore>EPS) custom.current_installment_paid=paidBefore; else delete custom.current_installment_paid;
      if(meta.debt_balance_tracked===true && Number.isFinite(+meta.debt_balance_before)){
        d.balance=Math.max(0,roundMoney(meta.debt_balance_before));
        custom.balance_source=meta.debt_balance_source==='plan'?'taksit_plani_v222':'kayitli';
      }
      d.custom=custom;d.updatedAt=new Date().toISOString();
      return d;
    }

    // En son eski kayıt için, ödeme mevcut taksitin içinde kalıyorsa tersine çevrilebilir.
    if(affected.length===1){
      const d=normalizeDebt(clone(rawDebt)),custom={...(d.custom||{})};
      const currentPaid=Math.max(0,roundMoney(custom.current_installment_paid));
      if(currentPaid+EPS>=target.amount && (+d.minimum||0)>EPS){
        const beforePaid=Math.max(0,roundMoney(currentPaid-target.amount));
        if(beforePaid>EPS) custom.current_installment_paid=beforePaid; else delete custom.current_installment_paid;
        d.custom=custom;d.status='active';d.updatedAt=new Date().toISOString();
        return d;
      }
    }
    return null;
  }

  function buildRecalculation(targetId,replacement=null){
    const target=state.payments.map(normalizePayment).find(p=>p.id===targetId);
    if(!target) throw new Error('Ödeme kaydı bulunamadı.');
    const rawDebt=state.debts.find(x=>normalizeDebt(x).id===target.debtId);
    if(!rawDebt) throw new Error('Ödemenin bağlı olduğu borç bulunamadı.');

    const ordered=paymentOrderForDebt(target.debtId),pos=ordered.findIndex(x=>x.p.id===targetId);
    if(pos<0) throw new Error('Ödeme sırası belirlenemedi.');
    const affected=ordered.slice(pos);
    const baseline=baselineFromTarget(rawDebt,affected[0],affected);
    if(!baseline) throw new Error('Bu eski ödeme için güvenli başlangıç durumu oluşturulamadı. Borç planını bozmamak için işlem yapılmadı.');

    if(replacement && pos>0 && String(replacement.date||'')<String(ordered[pos-1].p.date||'')){
      throw new Error('Ödeme tarihi aynı borcun bir önceki ödemesinden daha eski olamaz.');
    }

    const replay=[];
    if(replacement) replay.push({raw:replacement,p:normalizePayment(replacement),created:ordered[pos].created,index:ordered[pos].index});
    affected.slice(1).forEach(x=>replay.push({raw:x.raw,p:x.p,created:x.created,index:x.index}));
    replay.sort((a,b)=>String(a.p.date||'').localeCompare(String(b.p.date||''))||a.created.localeCompare(b.created)||a.index-b.index);

    let debt=normalizeDebt(clone(baseline));
    const updatedPayments=[];
    replay.forEach(entry=>{
      const p=cleanDerivedPayment(entry.raw);
      applyPaymentPlan(debt,p.date,p.amount,p);
      updatedPayments.push(normalizePayment(p));
    });

    return {
      originalDebt:normalizeDebt(clone(rawDebt)),
      affectedOriginals:affected.map(x=>normalizePayment(clone(x.raw))),
      updatedDebt:normalizeDebt(debt),updatedPayments
    };
  }

  function applyLocalResult(result,targetId,deleting){
    const di=state.debts.findIndex(x=>normalizeDebt(x).id===result.updatedDebt.id);if(di>=0)state.debts[di]=result.updatedDebt;
    const updated=new Map(result.updatedPayments.map(p=>[p.id,p]));
    state.payments=state.payments.filter(raw=>!(deleting&&normalizePayment(raw).id===targetId)).map(raw=>updated.get(normalizePayment(raw).id)||raw);
    saveState();
  }

  async function applyCloudResult(result,targetId,deleting){
    const originals=result.affectedOriginals.map(p=>normalizePayment(clone(p))),originalDebt=normalizeDebt(clone(result.originalDebt));let operationError=null;
    syncing=true;
    try{
      for(const p of result.updatedPayments) await cloudUpsertPayment(normalizePayment(p));
      await cloudUpsertDebt(normalizeDebt(result.updatedDebt));
      if(deleting) await deleteCloud('odemeler',targetId);
    }catch(e){
      operationError=e;
      try{await cloudUpsertDebt(originalDebt);for(const p of originals)await cloudUpsertPayment(p);}catch(rb){console.error('Ödeme geri alma hatası:',rb);}
    }finally{syncing=false;}
    try{await pullCloud();}catch(_e){}
    if(operationError) throw operationError;
  }

  async function simplePaymentUpdate(updated){
    if(session){syncing=true;try{await cloudUpsertPayment(updated);}finally{syncing=false;}await pullCloud();return;}
    const i=state.payments.findIndex(x=>normalizePayment(x).id===updated.id);if(i>=0)state.payments[i]=updated;saveState();
  }

  function ensureEditDebtOption(payment){
    const select=document.querySelector('#recordForm [name="debtId"]');if(!select)return;
    const debt=state.debts.map(normalizeDebt).find(d=>d.id===payment.debtId);
    if(![...select.options].some(o=>o.value===payment.debtId)){const o=document.createElement('option');o.value=payment.debtId;o.textContent=debt?.name||'Mevcut borç';select.appendChild(o);}
    select.value=payment.debtId;select.tabIndex=-1;select.setAttribute('aria-readonly','true');select.style.pointerEvents='none';select.style.background='#f8fafc';select.style.color='#64748b';
    const label=select.closest('label');if(label&&!label.querySelector('.bs-payment-debt-lock')){const h=document.createElement('small');h.className='bs-payment-debt-lock';h.textContent='Bağlı borç değiştirilemez. Yanlış borç seçildiyse ödemeyi silip doğru borca yeniden girin.';h.style.cssText='display:block;margin-top:5px;color:#64748b;font-size:10px;line-height:1.35';label.appendChild(h);}
  }

  function openPaymentEdit(payment){document.querySelector('#detailDialog')?.close();openRecordDialog('payments',payment);const t=document.querySelector('#recordDialogTitle');if(t)t.textContent='Ödemeyi Düzenle';ensureEditDebtOption(payment);}

  async function deletePayment(paymentId,button=null){
    const p=state.payments.map(normalizePayment).find(x=>x.id===paymentId);if(!p)return;
    if(!confirm('Bu ödeme silinsin mi? Borç bakiyesi ve taksit planı ödeme yapılmadan önceki duruma göre yeniden hesaplanacak.'))return;
    if(button){button.disabled=true;button.textContent='Siliniyor…';}
    try{const result=buildRecalculation(paymentId,null);if(session)await applyCloudResult(result,paymentId,true);else applyLocalResult(result,paymentId,true);document.querySelector('#detailDialog')?.close();toast('Ödeme silindi; sonraki ödemeler yeniden hesaplandı.');}
    catch(e){alert(`Ödeme silinemedi: ${e.message}`);if(button){button.disabled=false;button.textContent='Sil';}}
  }

  function installPaymentDetailActions(){
    if(typeof showDetail!=='function'||showDetail.__bsPaymentEditorV240)return;
    const original=showDetail;
    showDetail=function(module,record){const r=original(module,record);if(module==='payments'){const a=document.querySelector('#detailContent .detail-actions');if(a)a.innerHTML=`<button type="button" class="secondary" data-v240-payment-edit="${esc(record.id)}">Düzenle</button><button type="button" class="danger-btn" data-v240-payment-delete="${esc(record.id)}">Sil</button>`;}return r;};
    showDetail.__bsPaymentEditorV240=true;
  }

  function installUndoCapture(){
    if(typeof applyPaymentPlan!=='function'||applyPaymentPlan.__bsPaymentUndoV240)return;
    const original=applyPaymentPlan;
    applyPaymentPlan=function(raw,paymentDate,explicitAmount=null,paymentRecord=null){
      let target=paymentRecord;
      if(!target&&explicitAmount==null&&raw){const debtId=normalizeDebt(raw).id;for(let i=state.payments.length-1;i>=0;i--){const p=normalizePayment(state.payments[i]);if(p.debtId===debtId&&p.date===paymentDate){target=state.payments[i];break;}}}
      if(target){const c=paymentCustom(target);if(!c.payment_undo_v240&&!c.payment_undo_v239&&!c.payment_undo_v238){c.payment_undo_v240=captureUndo(raw);target.custom=c;}}
      return original(raw,paymentDate,explicitAmount,paymentRecord||target);
    };
    applyPaymentPlan.__bsPaymentUndoV240=true;
  }

  function installEvents(){
    if(window.__bsPaymentEditorV240Events)return;window.__bsPaymentEditorV240Events=true;
    document.addEventListener('click',e=>{
      const edit=e.target.closest('[data-v240-payment-edit]');if(edit){e.preventDefault();e.stopPropagation();const p=state.payments.map(normalizePayment).find(x=>x.id===edit.dataset.v240PaymentEdit);if(p)openPaymentEdit(p);return;}
      const del=e.target.closest('[data-v240-payment-delete]');if(del){e.preventDefault();e.stopPropagation();deletePayment(del.dataset.v240PaymentDelete,del);}
    },true);

    const form=document.querySelector('#recordForm');if(!form)return;
    form.addEventListener('submit',async e=>{
      const module=form.querySelector('[name="module"]')?.value,id=form.querySelector('[name="id"]')?.value;if(module!=='payments'||!id)return;
      const target=state.payments.map(normalizePayment).find(x=>x.id===id);if(!target)return;
      e.preventDefault();e.stopImmediatePropagation();
      const fd=Object.fromEntries(new FormData(form)),amount=roundMoney(fd.amount);if(amount<=0){toast('Ödeme tutarı sıfırdan büyük olmalı.');return;}if(fd.debtId&&fd.debtId!==target.debtId){toast('Ödemenin bağlı olduğu borç değiştirilemez.');return;}
      const submit=form.querySelector('button[type="submit"]'),old=submit?.textContent||'Kaydet';if(submit){submit.disabled=true;submit.textContent='Kaydediliyor…';}
      try{
        const custom=parseCustomValues(fd,'payments',target.custom||{});
        const sameEffect=Math.abs(amount-target.amount)<=EPS&&String(fd.date||'')===String(target.date||'');
        if(sameEffect){await simplePaymentUpdate(normalizePayment({...target,date:fd.date,amount,notes:fd.notes||'',custom}));}
        else{
          const replacement=normalizePayment({...target,date:fd.date,amount,notes:fd.notes||'',custom,debtId:target.debtId});
          const result=buildRecalculation(id,replacement);if(session)await applyCloudResult(result,id,false);else applyLocalResult(result,id,false);
        }
        document.querySelector('#recordDialog')?.close();toast(sameEffect?'Ödeme güncellendi.':'Ödeme güncellendi; ödeme zinciri yeniden hesaplandı.');
      }catch(err){alert(`Ödeme güncellenemedi: ${err.message}`);if(submit){submit.disabled=false;submit.textContent=old;}}
    },true);
  }

  function install(){
    if(!window.__bsPaymentPlanV3Loaded||!window.__bsDebtBalanceV236Installed||typeof applyPaymentPlan!=='function'){setTimeout(install,80);return;}
    installUndoCapture();installPaymentDetailActions();installEvents();try{renderDashboard();renderPayments();}catch(_e){}
  }
  install();
})();