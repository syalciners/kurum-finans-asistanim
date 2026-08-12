/* BS OFİS BÜTÇE V2.2.0 - Ödeme / toplam borç bakiyesi bütünlüğü */
(() => {
  if(window.__bsDebtBalanceV220Loaded) return;
  window.__bsDebtBalanceV220Loaded=true;

  const EPS=.005;
  const roundMoney=n=>Math.round((+n||0)*100)/100;

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

  function installDebtDetailBalance(){
    if(typeof showDetail!=='function' || showDetail.__bsDebtBalanceDetailV220) return;

    const originalShowDetailV220=showDetail;
    const wrapped=function(module,record){
      originalShowDetailV220(module,record);
      if(module!=='debts') return;

      const d=normalizeDebt(record);
      const tracked=(+d.balance||0)>EPS || (+d.original||0)>EPS;
      if(!tracked) return;

      const grid=document.querySelector('#detailContent .detail-grid');
      if(!grid || grid.querySelector('.bs-debt-balance-row')) return;

      const row=document.createElement('div');
      row.className='detail-row bs-debt-balance-row';
      row.innerHTML=`<span>Toplam kalan borç</span><strong>${money(Math.max(0,+d.balance||0))}</strong>`;
      grid.prepend(row);
    };

    wrapped.__bsDebtBalanceDetailV220=true;
    showDetail=wrapped;
  }

  function install(){
    if(window.__bsDebtBalanceV220Installed) return;

    // Eski payment-plan fallback'i çok yavaş cihazda gecikebilir.
    // Her durumda V4 taksit motorunun son hali yüklendikten sonra sarılır.
    if(!window.__bsPaymentPlanV3Loaded || typeof applyPaymentPlan!=='function'){
      setTimeout(install,80);
      return;
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
    window.__bsDebtBalanceV220Installed=true;
    installDebtDetailBalance();
  }

  install();
})();
