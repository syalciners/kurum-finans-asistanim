/* BS OFİS BÜTÇE V2.5.8.5 - Ödeme kartında borç sahibi
   Yalnızca Ödemeler ekranının sunum katmanı.
   Ödeme/borç hesaplama ve kayıt davranışını değiştirmez. */
(() => {
  if(window.__bsPaymentOwnerLabelV2585Loaded) return;
  window.__bsPaymentOwnerLabelV2585Loaded = true;

  function applyPaymentOwnerLabels(){
    if(
      typeof state !== 'object' ||
      !Array.isArray(state?.payments) ||
      !Array.isArray(state?.debts) ||
      typeof normalizePayment !== 'function' ||
      typeof normalizeDebt !== 'function' ||
      typeof parseDate !== 'function'
    ) return;

    const payments = state.payments.map(normalizePayment);
    const debts = state.debts.map(normalizeDebt);
    const paymentById = new Map(payments.map(payment => [String(payment.id), payment]));
    const debtById = new Map(debts.map(debt => [String(debt.id), debt]));

    document.querySelectorAll('#paymentList .list-card[data-payment]').forEach(card => {
      const payment = paymentById.get(String(card.dataset.payment || ''));
      if(!payment) return;

      const debt = debtById.get(String(payment.debtId || ''));
      const owner = String(debt?.custom?.debt_owner || '').trim();
      const detail = card.querySelector('.main small');
      if(!detail) return;

      const parts = [
        parseDate(payment.date).toLocaleDateString('tr-TR'),
        owner,
        String(payment.addedBy || '').trim()
      ].filter(Boolean);

      detail.textContent = parts.join(' · ');
    });
  }

  function installRenderHook(){
    if(typeof renderPayments !== 'function' || renderPayments.__bsPaymentOwnerLabelV2585Wrapped) return;

    const original = renderPayments;
    const wrapped = function(...args){
      const result = original.apply(this,args);
      applyPaymentOwnerLabels();
      return result;
    };

    wrapped.__bsPaymentOwnerLabelV2585Wrapped = true;
    renderPayments = wrapped;
  }

  installRenderHook();
  applyPaymentOwnerLabels();
})();
