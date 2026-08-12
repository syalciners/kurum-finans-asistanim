/* BS OFİS BÜTÇE V2.2.0 - Ödeme / toplam borç bakiyesi bütünlüğü */
(() => {
  if(window.__bsDebtBalanceV220Loaded) return;
  window.__bsDebtBalanceV220Loaded=true;

  const EPS=.005;
  const roundMoney=n=>Math.round((+n||0)*100)/100;

  if(typeof applyPaymentPlan!=='function'){
    console.warn('V220 bakiye katmanı: applyPaymentPlan bulunamadı.');
    return;
  }

  function latestPayment(debtId,paymentDate){
    for(let i=state.payments.length-1;i>=0;i--){
      const p=normalizePayment(state.payments[i]);
      if(p.debtId===debtId && p.date===paymentDate){
        return state.payments[i];
      }
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

  const originalApplyPaymentPlanV220=applyPaymentPlan;

  applyPaymentPlan=function(raw,paymentDate,explicitAmount=null,paymentRecord=null){
    if(!raw) return raw;

    const before=normalizeDebt(raw);
    const rawPayment=paymentRecord || (
      explicitAmount==null
        ?latestPayment(before.id,paymentDate)
        :null
    );

    // Aynı ödeme kaydı yeniden işlenirse taksit ve bakiye ikinci kez ilerlemesin.
    if(rawPayment && paymentCustom(rawPayment).debt_balance_v1){
      return raw;
    }

    const paymentAmount=roundMoney(
      explicitAmount!=null
        ?explicitAmount
        :rawPayment
          ?normalizePayment(rawPayment).amount
          :0
    );

    if(paymentAmount<=0){
      return originalApplyPaymentPlanV220(raw,paymentDate,explicitAmount,paymentRecord);
    }

    const balanceBefore=Math.max(0,roundMoney(before.balance));
    const balanceTracked=balanceBefore>EPS;

    // Toplam bakiye takip ediliyorsa borçtan fazla tutar taksitleri gereksiz ilerletmesin.
    const planAmount=balanceTracked
      ?Math.min(paymentAmount,balanceBefore)
      :paymentAmount;

    const result=originalApplyPaymentPlanV220(
      raw,
      paymentDate,
      planAmount,
      rawPayment||paymentRecord
    );

    if(!balanceTracked){
      markPayment(rawPayment,{
        debt_balance_tracked:false,
        debt_balance_before:balanceBefore,
        debt_balance_after:balanceBefore,
        debt_balance_applied:0,
        debt_balance_unapplied_amount:0
      });
      return result;
    }

    const applied=Math.min(paymentAmount,balanceBefore);
    const balanceAfter=Math.max(0,roundMoney(balanceBefore-applied));
    raw.balance=balanceAfter;
    raw.updatedAt=new Date().toISOString();

    if(balanceAfter<=EPS){
      raw.balance=0;
      raw.status='closed';

      const custom={...(raw.custom||raw.ozel_alanlar||{})};
      if(
        custom.remaining_installments!=='' &&
        custom.remaining_installments!=null &&
        !Number.isNaN(+custom.remaining_installments)
      ){
        custom.remaining_installments=0;
      }
      delete custom.current_installment_paid;
      raw.custom=custom;
    }

    markPayment(rawPayment,{
      debt_balance_tracked:true,
      debt_balance_before:balanceBefore,
      debt_balance_after:balanceAfter,
      debt_balance_applied:roundMoney(applied),
      debt_balance_unapplied_amount:Math.max(0,roundMoney(paymentAmount-applied))
    });

    return result;
  };

  applyPaymentPlan.__bsDebtBalanceV220=true;
})();
