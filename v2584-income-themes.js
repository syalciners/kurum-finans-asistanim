/* BS OFİS BÜTÇE V2.6.1.0 - Gelir kartı tema ve pay dağılımı sunumu
   Yalnızca sunum katmanı.
   Gelir türü ve gelir sahibi birbirinden bağımsız işaretlenir.
   Bölünmüş tahsilatlarda sahip payları küçük renk göstergeleriyle sunulur. */
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

  const OWNER_META = {
    'Başak': {label:'Başak',className:'basak',order:0},
    'Süleyman': {label:'Süleyman',className:'suleyman',order:1},
    'Kurum Kasası': {label:'Kurum',className:'kurum',order:2}
  };

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
    }else if(type === 'Maaş'){
      card.classList.add('income-theme-salary');
    }

    const cls = ownerClass(owner);
    if(cls) card.classList.add(cls);
  }

  function splitShares(group){
    const totals = new Map();

    group.forEach(row => {
      const owner = String(row?.owner || '').trim();
      const amount = Number(row?.amount) || 0;
      if(!owner || amount <= 0) return;
      totals.set(owner,(totals.get(owner) || 0) + amount);
    });

    return [...totals.entries()]
      .map(([owner,amount]) => ({
        owner,
        amount,
        ...(OWNER_META[owner] || {label:owner,className:'neutral',order:99})
      }))
      .sort((a,b) => a.order - b.order || a.label.localeCompare(b.label,'tr'));
  }

  function renderSplitShareNote(card,group){
    const note = card.querySelector('.income-distribution, .income-share-note');
    if(!note) return;

    const shares = splitShares(group);

    // Tek sahipli tahsilatta sol şerit + kart tutarı yeterli; tekrar eden pay satırı kaldırılır.
    if(shares.length < 2){
      note.remove();
      return;
    }

    note.className = 'income-split-shares';
    note.textContent = '';
    note.setAttribute(
      'aria-label',
      `Dağılım: ${shares.map(share => `${share.label} ${money(share.amount)}`).join(', ')}`
    );

    shares.forEach(share => {
      const chip = document.createElement('span');
      chip.className = `income-share-chip income-share-${share.className}`;

      const dot = document.createElement('span');
      dot.className = 'income-share-dot';
      dot.setAttribute('aria-hidden','true');

      const text = document.createElement('span');
      text.textContent = `${share.label} ${money(share.amount)}`;

      chip.append(dot,text);
      note.appendChild(chip);
    });
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
        const shares = splitShares(group);
        const owners = shares.map(share => share.owner);

        applyCardTheme(card,sample?.type || '',owners.length === 1 ? owners[0] : '');
        renderSplitShareNote(card,group);
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
