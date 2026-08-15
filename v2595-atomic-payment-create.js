/* BS OFİS BÜTÇE V2.5.9.5 - Yeni ödeme + borç güncellemesini atomik kaydet */
(() => {
  if(window.__bsAtomicPaymentCreateV2595Loaded) return;
  window.__bsAtomicPaymentCreateV2595Loaded = true;

  const RPC_NAME = 'odeme_borc_atomik_kaydet_v1';

  function install(){
    if(
      typeof payCloud !== 'function' ||
      typeof normalizeDebt !== 'function' ||
      typeof normalizePayment !== 'function' ||
      typeof applyPaymentPlan !== 'function'
    ){
      setTimeout(install,80);
      return;
    }

    if(payCloud.__bsAtomicPaymentCreateV2595) return;

    const atomicPayCloud = async function(debtId,amount,date,notes,custom){
      if(!session) return false;

      const currentRaw = state.debts.find(x => normalizeDebt(x).id === debtId);
      if(!currentRaw) return false;

      const currentDebt = normalizeDebt(currentRaw);
      const expectedUpdatedAt = currentDebt.updatedAt;
      const updatedDebt = clone(currentRaw);
      const payment = normalizePayment({
        id:uid(),
        debtId,
        amount:+amount||0,
        date,
        notes:notes||'',
        custom:custom||{},
        addedBy:deviceName(),
        createdAt:new Date().toISOString()
      });

      // Mevcut V222-V240 motoru nihai taksit/bakiye/undo metadata'sını üretir.
      applyPaymentPlan(updatedDebt,date,payment.amount,payment);
      const debt = normalizeDebt(updatedDebt);

      if(!sb?.rpc){
        throw new Error('Bulut ödeme servisi hazır değil.');
      }

      try{
        const {data,error} = await sb.rpc(RPC_NAME,{
          p_odeme:{
            id:payment.id,
            debtId:payment.debtId,
            date:payment.date,
            amount:payment.amount,
            notes:payment.notes||'',
            custom:payment.custom||{},
            addedBy:payment.addedBy||deviceName(),
            createdAt:payment.createdAt
          },
          p_borc:{
            id:debt.id,
            balance:debt.balance,
            minimum:debt.minimum,
            dueDate:debt.dueDate||'',
            status:debt.status,
            custom:debt.custom||{}
          },
          p_borc_onceki_guncelleme_zamani:expectedUpdatedAt
        });

        if(error) throw error;
        if(!data?.basarili) throw new Error('Atomik ödeme işlemi doğrulanamadı.');

        await pullCloud();
        return true;
      }catch(error){
        const message = error?.message || String(error);

        // Başka cihaz borcu değiştirdiyse önce güncel veriyi getir; otomatik tekrar ödeme yapma.
        if(message.includes('başka bir cihazda güncellendi')){
          try{ await pullCloud(); }catch(_refreshError){}
        }

        alert(`Ödeme kaydedilemedi: ${message}`);
        throw error;
      }
    };

    atomicPayCloud.__bsAtomicPaymentCreateV2595 = true;
    payCloud = atomicPayCloud;
  }

  install();
})();
