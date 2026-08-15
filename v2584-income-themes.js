/* BS OFİS BÜTÇE V2.5.8.4 - Gelir kartı tema işaretleme
   Yalnızca sunum katmanı.
   Özel Ders = turuncu; Maaş = gelir sahibinin rengi. */
(() => {
  if(window.__bsIncomeThemesV2584Loaded) return;
  window.__bsIncomeThemesV2584Loaded = true;

  const THEME_CLASSES = [
    'income-theme-lesson',
    'income-theme-salary',
    'income-theme-owner-basak',
    'income-theme-owner-suleyman',
    'income-theme-owner-kurum'
  ];

  function ownerClass(owner){
    if(owner === 'Başak') return 'income-theme-owner-basak';
    if(owner === 'Süleyman') return 'income-theme-owner-suleyman';
    if(owner === 'Kurum Kasası') return 'income-theme-owner-kurum';
    return '';
  }

  function applyCardTheme(card,type,owner){
    card.classList.remove(...THEME_CLASSES);

    if(type === 'Özel Ders'){
      card.classList.add('income-theme-lesson');
      return;
    }

    if(type === 'Maaş'){
      card.classList.add('income-theme-salary');
      const cls = ownerClass(owner);
      if(cls) card.classList.add(cls);
    }
  }

  function applyIncomeThemes(){
    if(typeof state !== 'object' || !Array.isArray(state?.incomes) || typeof normalizeIncome !== 'function') return;

    const rows = state.incomes.map(normalizeIncome);
    const byId = new Map(rows.map(row => [String(row.id),row]));
    const bySource = new Map();

    rows.forEach(row => {
      if(!row.sourceRecordId) return;
      const key = String(row.sourceRecordId);
      if(!bySource.has(key)) bySource.set(key,[]);
      bySource.get(key).push(row);
    });

    document.querySelectorAll('#incomeList .list-card').forEach(card => {
      const paymentId = card.dataset.bsPayment;
      const incomeId = card.dataset.income;

      if(paymentId){
        const group = bySource.get(String(paymentId)) || [];
        const sample = group[0];
        const owners = [...new Set(group.map(row => row.owner).filter(Boolean))];
        applyCardTheme(card,sample?.type || '',owners.length === 1 ? owners[0] : '');
        return;
      }

      if(incomeId){
        const row = byId.get(String(incomeId));
        applyCardTheme(card,row?.type || '',row?.owner || '');
      }
    });
  }

  function installRenderHook(){
    if(typeof renderIncomes !== 'function' || renderIncomes.__bsIncomeThemesV2584Wrapped) return;

    const original = renderIncomes;
    const wrapped = function(...args){
      const result = original.apply(this,args);
      applyIncomeThemes();
      return result;
    };

    wrapped.__bsIncomeThemesV2584Wrapped = true;
    renderIncomes = wrapped;
  }

  installRenderHook();
  applyIncomeThemes();

  window.bsApplyIncomeThemesV2584 = applyIncomeThemes;
})();
