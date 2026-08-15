/* BS OFİS BÜTÇE V2.6.0.0 - Gelir kartı sahip işaretleme
   Yalnızca sunum katmanı.
   Tek sahipli kartlarda sahibin rengi, çok sahipli otomatik tahsilatlarda birleşik sahip şeridi kullanılır. */
(() => {
  if(window.__bsIncomeThemesV2584Loaded) return;
  window.__bsIncomeThemesV2584Loaded = true;

  const THEME_CLASSES = [
    'income-theme-lesson',
    'income-theme-salary',
    'income-theme-owner-basak',
    'income-theme-owner-suleyman',
    'income-theme-owner-kurum',
    'income-theme-multi',
    'income-theme-multi-basak-suleyman',
    'income-theme-multi-basak-kurum',
    'income-theme-multi-suleyman-kurum',
    'income-theme-multi-all'
  ];

  const OWNER_ORDER = ['Başak','Süleyman','Kurum Kasası'];

  function ownerClass(owner){
    if(owner === 'Başak') return 'income-theme-owner-basak';
    if(owner === 'Süleyman') return 'income-theme-owner-suleyman';
    if(owner === 'Kurum Kasası') return 'income-theme-owner-kurum';
    return '';
  }

  function multiOwnerClass(owners){
    const set = new Set(owners);
    if(set.size < 2) return '';
    if(set.size >= 3) return 'income-theme-multi-all';
    if(set.has('Başak') && set.has('Süleyman')) return 'income-theme-multi-basak-suleyman';
    if(set.has('Başak') && set.has('Kurum Kasası')) return 'income-theme-multi-basak-kurum';
    if(set.has('Süleyman') && set.has('Kurum Kasası')) return 'income-theme-multi-suleyman-kurum';
    return '';
  }

  function applyCardTheme(card,type,ownerInput){
    card.classList.remove(...THEME_CLASSES);

    if(type === 'Özel Ders') card.classList.add('income-theme-lesson');
    if(type === 'Maaş') card.classList.add('income-theme-salary');

    const owners = [...new Set(
      (Array.isArray(ownerInput) ? ownerInput : [ownerInput])
        .map(x => String(x || '').trim())
        .filter(x => OWNER_ORDER.includes(x))
    )];

    if(owners.length === 1){
      const cls = ownerClass(owners[0]);
      if(cls) card.classList.add(cls);
      return;
    }

    if(owners.length > 1){
      card.classList.add('income-theme-multi');
      const cls = multiOwnerClass(owners);
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
        applyCardTheme(card,sample?.type || '',owners);
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
