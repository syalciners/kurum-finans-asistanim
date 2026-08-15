/* BS OFİS BÜTÇE V2.5.8.7 - Borç kartlarında borç sahibi renk işaretleme
   Yalnızca Borçlar ekranının sunum katmanı.
   Başak = pembe, Süleyman = mavi, Kurum = turkuaz. */
(() => {
  if(window.__bsDebtOwnerColorsV2587Loaded) return;
  window.__bsDebtOwnerColorsV2587Loaded = true;

  const OWNER_CLASSES = [
    'debt-owner-basak',
    'debt-owner-suleyman',
    'debt-owner-kurum'
  ];

  function ownerClass(owner){
    if(owner === 'Başak') return 'debt-owner-basak';
    if(owner === 'Süleyman') return 'debt-owner-suleyman';
    if(owner === 'Kurum Kasası' || owner === 'Kurum') return 'debt-owner-kurum';
    return '';
  }

  function applyDebtOwnerColors(){
    if(
      typeof state !== 'object' ||
      !Array.isArray(state?.debts) ||
      typeof normalizeDebt !== 'function'
    ) return;

    const debtById = new Map(
      state.debts
        .map(normalizeDebt)
        .map(debt => [String(debt.id), debt])
    );

    document.querySelectorAll('#debtList .list-card[data-debt]').forEach(card => {
      const debt = debtById.get(String(card.dataset.debt || ''));
      if(!debt) return;

      const owner = String(debt.custom?.debt_owner || '').trim();
      card.classList.remove(...OWNER_CLASSES);

      const cls = ownerClass(owner);
      if(cls) card.classList.add(cls);
    });
  }

  function installRenderHook(){
    if(typeof renderDebts !== 'function' || renderDebts.__bsDebtOwnerColorsV2587Wrapped) return;

    const original = renderDebts;
    const wrapped = function(...args){
      const result = original.apply(this,args);
      applyDebtOwnerColors();
      return result;
    };

    wrapped.__bsDebtOwnerColorsV2587Wrapped = true;
    renderDebts = wrapped;
  }

  installRenderHook();
  applyDebtOwnerColors();
})();
