/* BS OFİS BÜTÇE V1.7.6 - Ödemeler ve Harcamalar UX */
(() => {
  let expenseQuickMode = 'all';

  function ensureV176Styles(){
    if(document.querySelector('#v176Styles')) return;

    const style = document.createElement('style');
    style.id = 'v176Styles';
    style.textContent = `
      #expenses .toolbar.v176-expense-toolbar{
        grid-template-columns:minmax(120px,1fr) auto auto;
      }
      .v176-expense-note{
        display:flex;
        justify-content:space-between;
        gap:10px;
        align-items:center;
        margin:2px 2px 10px;
        color:var(--muted);
        font-size:11px;
      }
      .v176-expense-note strong{
        color:var(--ink);
        font-size:11px;
      }
      @media(max-width:480px){
        #expenses .toolbar.v176-expense-toolbar{
          grid-template-columns:1fr 1fr;
        }
        #expenses .toolbar.v176-expense-toolbar input{
          grid-column:1/-1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function paymentLists(){
    const current = monthKey();
    const previous = previousMonthKey();
    const all = state.payments.map(normalizePayment);

    return {
      current: all.filter(p => p.date?.startsWith(current)),
      previous: all.filter(p => p.date?.startsWith(previous)),
      all
    };
  }

  function ensurePaymentQuickCards(){
    const view = document.querySelector('#payments');
    const title = view?.querySelector('.page-title');
    if(!view || !title || document.querySelector('#v176PaymentKpis')) return;

    const wrap = document.createElement('div');
    wrap.id = 'v176PaymentKpis';
    wrap.className = 'v175-quick-grid';
    wrap.innerHTML = `
      <article class="v175-quick-card" data-payment-quick="current" role="button" tabindex="0">
        <span>BU AY</span>
        <strong id="v176PayCurrentAmount">₺0</strong>
        <small id="v176PayCurrentCount">0 ödeme</small>
      </article>
      <article class="v175-quick-card" data-payment-quick="previous" role="button" tabindex="0">
        <span>GEÇEN AY</span>
        <strong id="v176PayPreviousAmount">₺0</strong>
        <small id="v176PayPreviousCount">0 ödeme</small>
      </article>
      <article class="v175-quick-card" data-payment-quick="all" role="button" tabindex="0">
        <span>TÜMÜ</span>
        <strong id="v176PayAllAmount">₺0</strong>
        <small id="v176PayAllCount">0 ödeme</small>
      </article>
    `;
    title.insertAdjacentElement('afterend', wrap);

    const apply = mode => {
      const period = document.querySelector('#paymentPeriodFilter');
      if(period) period.value = mode;
      renderPayments();
    };

    wrap.addEventListener('click', e => {
      const card = e.target.closest('[data-payment-quick]');
      if(card) apply(card.dataset.paymentQuick);
    });

    wrap.addEventListener('keydown', e => {
      const card = e.target.closest('[data-payment-quick]');
      if(!card || !['Enter',' '].includes(e.key)) return;
      e.preventDefault();
      apply(card.dataset.paymentQuick);
    });
  }

  function updatePaymentQuickCards(){
    ensurePaymentQuickCards();
    const lists = paymentLists();
    const period = document.querySelector('#paymentPeriodFilter')?.value || 'current';

    const data = [
      ['current','#v176PayCurrentAmount','#v176PayCurrentCount'],
      ['previous','#v176PayPreviousAmount','#v176PayPreviousCount'],
      ['all','#v176PayAllAmount','#v176PayAllCount']
    ];

    data.forEach(([key, amountSel, countSel]) => {
      const list = lists[key];
      const amount = document.querySelector(amountSel);
      const count = document.querySelector(countSel);
      if(amount) amount.textContent = money(list.reduce((s,p)=>s+(+p.amount||0),0));
      if(count) count.textContent = `${list.length} ödeme`;
    });

    document.querySelectorAll('[data-payment-quick]').forEach(card => {
      const active = card.dataset.paymentQuick === period;
      card.classList.toggle('active', active);
      card.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderPaymentsV176(){
    ensurePaymentQuickCards();

    const period = document.querySelector('#paymentPeriodFilter')?.value || 'current';
    const current = monthKey();
    const previous = previousMonthKey();

    const list = state.payments
      .map(normalizePayment)
      .filter(p =>
        period === 'all' ||
        (period === 'current' && p.date?.startsWith(current)) ||
        (period === 'previous' && p.date?.startsWith(previous))
      )
      .sort((a,b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));

    const listEl = document.querySelector('#paymentList');
    if(listEl){
      listEl.innerHTML = list.length
        ? list.map(paymentCard).join('')
        : empty(
            period === 'current'
              ? 'Bu ay henüz ödeme kaydı yok.'
              : period === 'previous'
                ? 'Geçen ay ödeme kaydı yok.'
                : 'Henüz borç ödemesi yok.'
          );
    }

    updatePaymentQuickCards();
  }

  function selectedExpenseMonthList(){
    populateMonths();
    const month = document.querySelector('#expenseMonth')?.value || monthKey();
    return state.expenses
      .map(normalizeExpense)
      .filter(x => x.date?.startsWith(month));
  }

  function expenseCategoryTotals(list){
    const totals = new Map();
    list.forEach(x => {
      totals.set(x.category, (totals.get(x.category) || 0) + (+x.amount || 0));
    });
    return [...totals.entries()].sort((a,b) => b[1] - a[1]);
  }

  function ensureExpenseCategoryFilter(){
    const toolbar = document.querySelector('#expenses .toolbar');
    if(!toolbar) return;

    toolbar.classList.add('v176-expense-toolbar');

    let select = document.querySelector('#v176ExpenseCategoryFilter');
    if(!select){
      select = document.createElement('select');
      select.id = 'v176ExpenseCategoryFilter';
      select.setAttribute('aria-label','Harcama kategorisi');
      toolbar.insertBefore(select, document.querySelector('#expenseMonth'));
      select.onchange = () => {
        expenseQuickMode = select.value === 'all' ? 'all' : 'category';
        renderExpenses();
      };
    }

    const current = select.value || 'all';
    const categories = [...new Set(state.expenses.map(normalizeExpense).map(x => x.category).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,'tr'));

    select.innerHTML = `
      <option value="all">Tüm kategoriler</option>
      ${categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
    `;
    select.value = categories.includes(current) ? current : 'all';
  }

  function expenseStats(monthList){
    const categoryTotals = expenseCategoryTotals(monthList);
    const topCategory = categoryTotals[0] || ['',0];
    const topExpense = [...monthList].sort((a,b)=>(+b.amount||0)-(+a.amount||0))[0] || null;

    return {
      total: monthList.reduce((s,x)=>s+(+x.amount||0),0),
      count: monthList.length,
      topCategory: topCategory[0],
      topCategoryAmount: topCategory[1],
      topExpense
    };
  }

  function ensureExpenseQuickCards(){
    const view = document.querySelector('#expenses');
    const title = view?.querySelector('.page-title');
    if(!view || !title || document.querySelector('#v176ExpenseKpis')) return;

    const wrap = document.createElement('div');
    wrap.id = 'v176ExpenseKpis';
    wrap.className = 'v175-quick-grid';
    wrap.innerHTML = `
      <article class="v175-quick-card" data-expense-quick="all" role="button" tabindex="0">
        <span>SEÇİLİ AY</span>
        <strong id="v176ExpenseTotal">₺0</strong>
        <small id="v176ExpenseCount">0 işlem</small>
      </article>
      <article class="v175-quick-card" data-expense-quick="top-category" role="button" tabindex="0">
        <span>EN BÜYÜK KATEGORİ</span>
        <strong id="v176ExpenseTopCategoryAmount">₺0</strong>
        <small id="v176ExpenseTopCategory">—</small>
      </article>
      <article class="v175-quick-card" data-expense-quick="top-expense" role="button" tabindex="0">
        <span>EN YÜKSEK HARCAMA</span>
        <strong id="v176ExpenseTopAmount">₺0</strong>
        <small id="v176ExpenseTopLabel">—</small>
      </article>
    `;
    title.insertAdjacentElement('afterend',wrap);

    const activate = mode => {
      const search = document.querySelector('#expenseSearch');
      const category = document.querySelector('#v176ExpenseCategoryFilter');
      const monthList = selectedExpenseMonthList();
      const stats = expenseStats(monthList);

      if(mode === 'all'){
        expenseQuickMode = 'all';
        if(search) search.value = '';
        if(category) category.value = 'all';
        renderExpenses();
        return;
      }

      if(mode === 'top-category'){
        if(!stats.topCategory) return;
        expenseQuickMode = 'top-category';
        if(search) search.value = '';
        if(category) category.value = stats.topCategory;
        renderExpenses();
        return;
      }

      if(mode === 'top-expense' && stats.topExpense){
        showDetail('expenses', stats.topExpense);
      }
    };

    wrap.addEventListener('click', e => {
      const card = e.target.closest('[data-expense-quick]');
      if(card) activate(card.dataset.expenseQuick);
    });

    wrap.addEventListener('keydown', e => {
      const card = e.target.closest('[data-expense-quick]');
      if(!card || !['Enter',' '].includes(e.key)) return;
      e.preventDefault();
      activate(card.dataset.expenseQuick);
    });
  }

  function updateExpenseQuickCards(monthList){
    ensureExpenseQuickCards();
    const stats = expenseStats(monthList);
    const category = document.querySelector('#v176ExpenseCategoryFilter')?.value || 'all';

    const total = document.querySelector('#v176ExpenseTotal');
    const count = document.querySelector('#v176ExpenseCount');
    const topCatAmount = document.querySelector('#v176ExpenseTopCategoryAmount');
    const topCat = document.querySelector('#v176ExpenseTopCategory');
    const topAmount = document.querySelector('#v176ExpenseTopAmount');
    const topLabel = document.querySelector('#v176ExpenseTopLabel');

    if(total) total.textContent = money(stats.total);
    if(count) count.textContent = `${stats.count} işlem`;
    if(topCatAmount) topCatAmount.textContent = money(stats.topCategoryAmount);
    if(topCat) topCat.textContent = stats.topCategory || '—';
    if(topAmount) topAmount.textContent = money(stats.topExpense?.amount || 0);
    if(topLabel) topLabel.textContent = stats.topExpense?.description || '—';

    document.querySelectorAll('[data-expense-quick]').forEach(card => {
      let active = false;
      if(card.dataset.expenseQuick === 'all') active = category === 'all';
      if(card.dataset.expenseQuick === 'top-category') active = !!stats.topCategory && category === stats.topCategory;
      card.classList.toggle('active',active);
      card.setAttribute('aria-pressed',active?'true':'false');
    });
  }

  function renderExpensesV176(){
    populateMonths();
    ensureExpenseCategoryFilter();
    ensureExpenseQuickCards();

    const q = (document.querySelector('#expenseSearch')?.value || '')
      .trim().toLocaleLowerCase('tr-TR');
    const month = document.querySelector('#expenseMonth')?.value || monthKey();
    const category = document.querySelector('#v176ExpenseCategoryFilter')?.value || 'all';

    const monthList = state.expenses
      .map(normalizeExpense)
      .filter(x => x.date?.startsWith(month));

    const list = monthList
      .filter(x =>
        (category === 'all' || x.category === category) &&
        (!q || `${x.description} ${x.category} ${x.method} ${x.notes} ${JSON.stringify(x.custom)}`
          .toLocaleLowerCase('tr-TR').includes(q))
      )
      .sort((a,b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));

    const filteredTotal = list.reduce((s,x)=>s+(+x.amount||0),0);
    const listEl = document.querySelector('#expenseList');

    if(listEl){
      const filterNote = category !== 'all'
        ? `<div class="v176-expense-note"><span>Aktif kategori</span><strong>${esc(category)} · ${money(filteredTotal)}</strong></div>`
        : '';

      listEl.innerHTML =
        filterNote +
        (list.length
          ? list.map(expenseCard).join('')
          : empty('Bu filtrede harcama yok.'));
    }

    updateExpenseQuickCards(monthList);
  }

  ensureV176Styles();
  ensurePaymentQuickCards();
  ensureExpenseCategoryFilter();
  ensureExpenseQuickCards();

  renderPayments = renderPaymentsV176;
  renderExpenses = renderExpensesV176;

  const paymentPeriod = document.querySelector('#paymentPeriodFilter');
  if(paymentPeriod) paymentPeriod.onchange = renderPayments;

  const expenseSearch = document.querySelector('#expenseSearch');
  const expenseMonth = document.querySelector('#expenseMonth');
  if(expenseSearch) expenseSearch.oninput = renderExpenses;
  if(expenseMonth) expenseMonth.onchange = () => {
    expenseQuickMode = 'all';
    const category = document.querySelector('#v176ExpenseCategoryFilter');
    if(category) category.value = 'all';
    renderExpenses();
  };

  renderPayments();
  renderExpenses();

  // V1.7.7 yönetim panelini V1.7.6 katmanından yükle.
  if(!document.querySelector('script[data-v177-loader]')){
    const script = document.createElement('script');
    script.src = 'v177-ui.js?v=177';
    script.dataset.v177Loader = '1';
    document.head.appendChild(script);
  }
})();