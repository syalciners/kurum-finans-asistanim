/* BS OFİS BÜTÇE V2.2.3 - Ödeme / toplam borç bakiyesi bütünlüğü */
(() => {
  if(window.__bsDebtBalanceV222Loaded) return;
  window.__bsDebtBalanceV222Loaded=true;

  const EPS=.005;
  const roundMoney=n=>Math.round((+n||0)*100)/100;

  function latestPayment(debtId,paymentDate){
    for(let i=state.payments.length-1;i>=0;i--){
      const p=normalizePayment(state.payments[i]);
      if(p.debtId===debtId && p.date===paymentDate) return state.payments[i];
    }
    return null;
  }

  function paymentCustom(rawPayment){
    return {...(rawPayment?.custom||rawPayment?.ozel_alanlar||{})};
  }

  function markPayment(rawPayment,meta){
    if(!rawPayment) return;
    rawPayment.custom={...paymentCustom(rawPayment),...meta,debt_balance_v1:true};
  }

  function planSummary(raw){
    try{
      return typeof window.bsDebtPlanSummary==='function'
        ?window.bsDebtPlanSummary(raw)
        :null;
    }catch(_e){
      return null;
    }
  }

  function resolveBalance(raw){
    const d=normalizeDebt(raw);
    const explicit=Math.max(0,roundMoney(d.balance));
    if(explicit>EPS){
      return {tracked:true,amount:explicit,source:'kayitli',summary:planSummary(d)};
    }

    const summary=planSummary(d);
    if(summary?.safe && summary.total>EPS){
      return {tracked:true,amount:roundMoney(summary.total),source:'plan',summary};
    }

    return {
      tracked:false,
      amount:0,
      source:summary?.mismatch?'plan_celiski':'tanimsiz',
      summary
    };
  }

  function ensureBalanceFieldVisible(){
    const field=appConfig?.fields?.debts?.builtIns?.find(x=>x.id==='balance');
    if(field) field.visible=true;
  }

  function installBalanceFormField(){
    if(typeof openRecordDialog!=='function' || openRecordDialog.__bsDebtBalanceFormV222) return;

    const originalOpenRecordDialogV222=openRecordDialog;
    const wrapped=function(module,record=null){
      if(module==='debts') ensureBalanceFieldVisible();
      const result=originalOpenRecordDialogV222(module,record);

      if(module==='debts'){
        const input=document.querySelector('#recordForm [name="balance"]');
        const label=input?.closest('label');
        if(label && !label.querySelector('.bs-balance-field-hint')){
          const hint=document.createElement('small');
          hint.className='bs-balance-field-hint';
          hint.style.cssText='color:#64748b;font-size:10px;font-weight:600;line-height:1.35';
          hint.textContent='İsteğe bağlıdır. Boşsa sistem tutarlı taksit planından toplam bakiyeyi otomatik hesaplar.';
          label.appendChild(hint);
        }
      }
      return result;
    };

    wrapped.__bsDebtBalanceFormV222=true;
    openRecordDialog=wrapped;
  }

  function installDebtDetailBalance(){
    if(typeof showDetail!=='function' || showDetail.__bsDebtBalanceDetailV222) return;

    const originalShowDetailV222=showDetail;
    const wrapped=function(module,record){
      originalShowDetailV222(module,record);
      if(module!=='debts') return;

      const d=normalizeDebt(record);
      const resolved=resolveBalance(d);
      const grid=document.querySelector('#detailContent .detail-grid');
      if(!grid || grid.querySelector('.bs-debt-balance-row')) return;

      const exactBankPlan=(
        d.custom?.plan_type==='exact_bank_schedule'
        ||Array.isArray(d.custom?.installment_schedule)
      );

      let value='Tanımlanmadı';
      let color='#c97800';
      let suffix='';

      if((+d.balance||0)>EPS){
        value=money(Math.max(0,+d.balance||0));
        color=exactBankPlan?'#2563eb':'';
        if(exactBankPlan){
          suffix=' <small style="font-size:8px;color:#64748b;font-weight:700">(otomatik)</small>';
        }
      }else if(resolved.tracked && resolved.source==='plan'){
        value=money(resolved.amount);
        color='#2563eb';
        suffix=' <small style="font-size:8px;color:#64748b;font-weight:700">(otomatik)</small>';
      }else if(resolved.source==='plan_celiski'){
        value='Plan kontrolü gerekli';
      }else if(d.status==='closed'){
        value=money(0);
        color='';
      }

      const row=document.createElement('div');
      row.className='detail-row bs-debt-balance-row';
      row.innerHTML=`<span>Toplam kalan borç</span><strong${color?` style="color:${color}"`:''}>${value}${suffix}</strong>`;
      grid.prepend(row);
    };

    wrapped.__bsDebtBalanceDetailV222=true;
    showDetail=wrapped;
  }

  function install(){
    if(window.__bsDebtBalanceV222Installed) return;

    if(
      !window.__bsPaymentPlanV3Loaded ||
      typeof applyPaymentPlan!=='function' ||
      typeof window.bsDebtPlanSummary!=='function'
    ){
      setTimeout(install,80);
      return;
    }

    const originalApplyPaymentPlanV222=applyPaymentPlan;

    applyPaymentPlan=function(raw,paymentDate,explicitAmount=null,paymentRecord=null){
      if(!raw) return raw;

      const before=normalizeDebt(raw);
      const rawPayment=paymentRecord || (explicitAmount==null?latestPayment(before.id,paymentDate):null);

      if(rawPayment && paymentCustom(rawPayment).debt_balance_v1) return raw;

      const paymentAmount=roundMoney(
        explicitAmount!=null
          ?explicitAmount
          :rawPayment
            ?normalizePayment(rawPayment).amount
            :0
      );

      if(paymentAmount<=0){
        return originalApplyPaymentPlanV222(raw,paymentDate,explicitAmount,paymentRecord);
      }

      const resolved=resolveBalance(before);
      const balanceBefore=resolved.amount;
      const balanceTracked=resolved.tracked;
      const planAmount=balanceTracked?Math.min(paymentAmount,balanceBefore):paymentAmount;

      // Kademeli planda tam geçiş ayındaysak V4 motoruna sonraki taksit tutarını bildir.
      if(resolved.summary?.safe && resolved.summary.kind==='phased'){
        const rows=resolved.summary.rows||[];
        const current=rows[0]?.planned||0;
        const next=rows[1]?.planned||0;
        if(current>EPS && next>EPS && Math.abs(current-next)>EPS){
          const custom={...(raw.custom||raw.ozel_alanlar||{})};
          custom.next_payment_after_current=roundMoney(next);
          custom.next_payment_source='kademeli_plan_v222';
          raw.custom=custom;
        }
      }

      const result=originalApplyPaymentPlanV222(raw,paymentDate,planAmount,rawPayment||paymentRecord);

      if(!balanceTracked){
        markPayment(rawPayment,{
          debt_balance_tracked:false,
          debt_balance_source:resolved.source,
          debt_balance_before:0,
          debt_balance_after:0,
          debt_balance_applied:0,
          debt_balance_unapplied_amount:0
        });
        return result;
      }

      const applied=Math.min(paymentAmount,balanceBefore);
      const balanceAfter=Math.max(0,roundMoney(balanceBefore-applied));
      raw.balance=balanceAfter;
      raw.updatedAt=new Date().toISOString();

      const afterSummary=planSummary(raw);
      if(afterSummary?.safe && afterSummary.kind==='phased' && afterSummary.rows?.[0]?.planned>EPS){
        raw.minimum=roundMoney(afterSummary.rows[0].planned);
      }

      const debtCustom={...(raw.custom||raw.ozel_alanlar||{})};
      debtCustom.balance_source=resolved.source==='plan'?'taksit_plani_v222':'kayitli';
      raw.custom=debtCustom;

      if(balanceAfter<=EPS){
        raw.balance=0;
        raw.status='closed';
        const custom={...(raw.custom||raw.ozel_alanlar||{})};
        if(custom.remaining_installments!=='' && custom.remaining_installments!=null && !Number.isNaN(+custom.remaining_installments)){
          custom.remaining_installments=0;
        }
        delete custom.current_installment_paid;
        raw.custom=custom;
      }

      markPayment(rawPayment,{
        debt_balance_tracked:true,
        debt_balance_source:resolved.source,
        debt_balance_before:balanceBefore,
        debt_balance_after:balanceAfter,
        debt_balance_applied:roundMoney(applied),
        debt_balance_unapplied_amount:Math.max(0,roundMoney(paymentAmount-applied))
      });

      return result;
    };

    applyPaymentPlan.__bsDebtBalanceV222=true;
    window.__bsDebtBalanceV222Installed=true;
    installBalanceFormField();
    installDebtDetailBalance();
  }

  install();
})();
