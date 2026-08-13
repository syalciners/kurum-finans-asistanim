/* BS OFİS BÜTÇE V2.3.6 - Ödeme / toplam borç bakiyesi bütünlüğü */
(() => {
  if(window.__bsDebtBalanceV236Loaded) return;
  window.__bsDebtBalanceV236Loaded=true;
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

  function isAutoBalance(d,resolved){
    const source=String(d?.custom?.balance_source||'').toLowerCase();
    if(source==='taksit_plani_v222' || source==='plan') return true;

    if((+d?.balance||0)<=EPS && resolved?.tracked && resolved.source==='plan') return true;

    const exactPlan=!!(
      d?.custom?.plan_type==='exact_schedule' ||
      d?.custom?.plan_type==='exact_bank_schedule' ||
      Array.isArray(d?.custom?.installment_schedule)
    );
    const summaryTotal=roundMoney(resolved?.summary?.total||0);
    const stored=roundMoney(d?.balance||0);
    return !!(
      exactPlan &&
      resolved?.summary?.safe &&
      summaryTotal>EPS &&
      stored>EPS &&
      Math.abs(stored-summaryTotal)<=.01
    );
  }

  function ensureBalanceFieldVisible(){
    const field=appConfig?.fields?.debts?.builtIns?.find(x=>x.id==='balance');
    if(field) field.visible=true;
  }

  function installBalanceFormField(){
    if(typeof openRecordDialog!=='function' || openRecordDialog.__bsDebtBalanceFormV236) return;

    const originalOpenRecordDialogV236=openRecordDialog;
    const wrapped=function(module,record=null){
      if(module==='debts') ensureBalanceFieldVisible();
      const result=originalOpenRecordDialogV236(module,record);

      if(module==='debts'){
        const input=document.querySelector('#recordForm [name="balance"]');
        const label=input?.closest('label');
        const d=record?normalizeDebt(record):null;
        const resolved=d?resolveBalance(d):null;
        const automatic=!!(d && isAutoBalance(d,resolved));

        if(input){
          delete input.dataset.bsAutoBalance;
          input.placeholder='';

          if(automatic){
            input.value='';
            input.dataset.bsAutoBalance='1';
            input.placeholder=resolved?.amount>EPS
              ?`Otomatik: ${money(resolved.amount)}`
              :'Otomatik hesaplanır';
          }
        }

        if(label){
          let hint=label.querySelector('.bs-balance-field-hint');
          if(!hint){
            hint=document.createElement('small');
            hint.className='bs-balance-field-hint';
            hint.style.cssText='color:#64748b;font-size:10px;font-weight:600;line-height:1.35';
            label.appendChild(hint);
          }

          hint.textContent=automatic
            ?resolved?.amount>EPS
              ?`Otomatik hesaplanan kalan borç: ${money(resolved.amount)}. Manuel tutar girmek istersen bu alanı kullanabilirsin.`
              :'Bu borcun toplam bakiyesi taksit planından otomatik hesaplanır.'
            :'İsteğe bağlıdır. Boşsa sistem tutarlı taksit planından toplam bakiyeyi otomatik hesaplar.';
        }
      }
      return result;
    };

    wrapped.__bsDebtBalanceFormV236=true;
    wrapped.__bsDebtBalanceFormV222=true;
    openRecordDialog=wrapped;
  }

  function installDebtDetailBalance(){
    if(typeof showDetail!=='function' || showDetail.__bsDebtBalanceDetailV236) return;

    const originalShowDetailV236=showDetail;
    const wrapped=function(module,record){
      originalShowDetailV236(module,record);
      if(module!=='debts') return;

      const d=normalizeDebt(record);
      const resolved=resolveBalance(d);
      const grid=document.querySelector('#detailContent .detail-grid');
      if(!grid || grid.querySelector('.bs-debt-balance-row')) return;

      const automatic=isAutoBalance(d,resolved);
      let value='Tanımlanmadı';
      let color='#c97800';
      let suffix='';

      if((+d.balance||0)>EPS){
        value=money(Math.max(0,+d.balance||0));
        color=automatic?'#2563eb':'';
        if(automatic){
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

    wrapped.__bsDebtBalanceDetailV236=true;
    wrapped.__bsDebtBalanceDetailV222=true;
    showDetail=wrapped;
  }

  function install(){
    if(window.__bsDebtBalanceV236Installed) return;

    if(
      !window.__bsPaymentPlanV3Loaded ||
      typeof applyPaymentPlan!=='function' ||
      typeof window.bsDebtPlanSummary!=='function'
    ){
      setTimeout(install,80);
      return;
    }

    const originalApplyPaymentPlanV236=applyPaymentPlan;

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
        return originalApplyPaymentPlanV236(raw,paymentDate,explicitAmount,paymentRecord);
      }

      const resolved=resolveBalance(before);
      const balanceBefore=resolved.amount;
      const balanceTracked=resolved.tracked;
      const planAmount=balanceTracked?Math.min(paymentAmount,balanceBefore):paymentAmount;

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

      const result=originalApplyPaymentPlanV236(raw,paymentDate,planAmount,rawPayment||paymentRecord);

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

    applyPaymentPlan.__bsDebtBalanceV236=true;
    applyPaymentPlan.__bsDebtBalanceV222=true;
    window.__bsDebtBalanceV236Installed=true;
    window.__bsDebtBalanceV222Installed=true;
    installBalanceFormField();
    installDebtDetailBalance();
  }

  install();
})();
