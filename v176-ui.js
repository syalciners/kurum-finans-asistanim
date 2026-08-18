/* BS OFİS BÜTÇE V2.1.8 - Ödemeler ve Harcamalar UX */
(() => {
  let expenseQuickMode = 'all';
  let paymentViewMode = 'all';

  function ensureV176Styles(){
    if(document.querySelector('#v176Styles')) return;

    const style = document.createElement('style');
    style.id = 'v176Styles';
    style.textContent = `
      #payments #v176PaymentTypeKpis{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:8px;
        margin:0 0 14px;
      }
      #payments #v176PaymentTypeKpis .v175-quick-card{
        min-height:76px!important;
        padding:11px 12px!important;
        border:1px solid #E2E8F0!important;
        border-radius:15px!important;
        background:#FFFFFF!important;
        box-shadow:0 2px 9px rgba(15,23,42,.03)!important;
        text-align:left!important;
        align-content:center!important;
        cursor:pointer;
      }
      #payments #v176PaymentTypeKpis .v175-quick-card span{
        color:#64748B!important;
        font-size:9px!important;
        line-height:1.1!important;
        font-weight:830!important;
        letter-spacing:.035em!important;
      }
      #payments #v176PaymentTypeKpis .v175-quick-card strong{
        margin-top:2px!important;
        font-size:18px!important;
        line-height:1.05!important;
        font-weight:860!important;
        letter-spacing:-.03em!important;
      }
      #payments #v176PaymentTypeKpis .v175-quick-card small{
        margin-top:2px!important;
        color:#94A3B8!important;
        font-size:9px!important;
        line-height:1.2!important;
      }
      #payments #v176PaymentTypeKpis [data-payment-view="payments"]{
        border-top:3px solid #2563EB!important;
      }
      #payments #v176PaymentTypeKpis [data-payment-view="payments"] strong{
        color:#2563EB!important;
      }
      #payments #v176PaymentTypeKpis [data-payment-view="expenses"]{
        border-top:3px solid #EF4444!important;
      }
      #payments #v176PaymentTypeKpis [data-payment-view="expenses"] strong{
        color:#2563EB!important;
      }
      #payments #v176PaymentTypeKpis [data-payment-view="payments"].active{
        border-color:#9FBCFF!important;
        border-top-color:#2563EB!important;
        background:linear-gradient(180deg,#F8FBFF 0%,#F2F7FF 100%)!important;
        box-shadow:0 0 0 2px rgba(37,99,235,.10),0 4px 12px rgba(37,99,235,.06)!important;
      }
      #payments #v176PaymentTypeKpis [data-payment-view="expenses"].active{
        border-color:#F5A5AB!important;
        border-top-color:#EF4444!important;
        background:linear-gradient(180deg,#FFF9F9 0%,#FFF2F3 100%)!important;
        box-shadow:0 0 0 2px rgba(239,68,68,.09),0 4px 12px rgba(239,68,68,.055)!important;
      }
      #payments #paymentList .list-card[data-expense],
      #payments #paymentList .v179-expense-card[data-expense]{
        border-left:3px solid #EF4444!important;
      }
      #payments #paymentList .list-card[data-expense] .amount,
      #payments #paymentList .v179-expense-card[data-expense] .amount{
        color:#2563EB!important;
      }

      #expenses .toolbar.v176-expense-toolbar{
        grid-template-columns:minmax(120px,1fr) auto auto;
      }
      .v176-expense-note{
        display:flex;
        justify-content:space-between;
        gap:10px;
        align-items:center;
        margin:2px 0 10px;
        padding:9px 11px;
        border:1px solid #f2d59e;
        border-radius:12px;
        background:#fff9ef;
        color:var(--muted);
        font-size:10px;
      }
      .v176-expense-note strong{
        color:#b96a00;
        font-size:10px;
        font-weight:850;
      }

      #v203ExpenseCategorySummary{
        margin:0 0 12px;
        padding:12px 13px;
        border:1px solid var(--line);
        border-radius:15px;
        background:var(--card);
        box-shadow:0 2px 8px rgba(15,23,42,.025);
      }
      .v203-expense-category-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:9px;
      }
      .v203-expense-category-head strong{
        color:var(--ink);
        font-size:11px;
        font-weight:850;
      }
      .v203-expense-category-reset{
        appearance:none;
        padding:0;
        border:0;
        background:transparent;
        color:var(--accent);
        font-size:9px;
        font-weight:800;
        cursor:pointer;
      }
      #v203ExpenseCategoryList{
        display:grid;
        gap:7px;
      }
      .v203-expense-category-row{
        appearance:none;
        width:100%;
        border:1px solid transparent;
        border-radius:11px;
        background:transparent;
        color:var(--ink);
        padding:7px 8px;
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        gap:5px 10px;
        text-align:left;
        cursor:pointer;
        -webkit-tap-highlight-color:transparent;
      }
      .v203-expense-category-row:hover{background:#f8fafc}
      .v203-expense-category-row.active{
        background:#fff7e8;
        border-color:#f2d59e;
      }
      .v203-expense-category-name{
        min-width:0;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        font-size:10px;
        font-weight:800;
      }
      .v203-expense-category-amount{
        font-size:10px;
        font-weight:850;
        white-space:nowrap;
      }
      .v203-expense-category-track{
        grid-column:1/-1;
        height:5px;
        overflow:hidden;
        border-radius:999px;
        background:#eef2f7;
      }
      .v203-expense-category-track span{
        display:block;
        height:100%;
        border-radius:inherit;
        background:#f59e0b;
      }
      .v203-expense-category-empty{
        padding:4px 2px;
        color:var(--muted);
        font-size:10px;
      }

      #expenseList .list-card[data-expense] .main{
        gap:5px;
      }
      #expenseList .list-card[data-expense] .main>strong{
        font-size:12px;
        line-height:1.25;
      }
      #expenseList .v205-expense-meta{
        display:flex;
        align-items:center;
        flex-wrap:wrap;
        gap:5px;
        color:var(--muted);
        font-size:9px;
        line-height:1.2;
      }
      #expenseList .v205-expense-date{
        white-space:nowrap;
      }
      #expenseList .v205-expense-category-pill{
        display:inline-flex;
        align-items:center;
        max-width:190px;
        padding:3px 7px;
        border-radius:999px;
        background:#fff3df;
        color:#b96a00;
        font-size:8px;
        font-weight:850;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #expenseList .v205-expense-added{
        white-space:nowrap;
      }
      #expenseList .amount .v205-expense-method{
        display:block;
        margin-top:4px;
        color:var(--muted);
        font-size:8px;
        font-weight:700;
        white-space:nowrap;
      }

      @media(max-width:480px){
        #payments #v176PaymentTypeKpis .v175-quick-card{
          min-height:70px!important;
          padding:10px!important;
        }
        #payments #v176PaymentTypeKpis .v175-quick-card strong{
          font-size:16px!important;
        }
        #expenses .toolbar.v176-expense-toolbar{
          grid-template-columns:1fr 1fr;
        }
        #expenses .toolbar.v176-expense-toolbar input{
          grid-column:1/-1;
        }
        #v203ExpenseCategorySummary{padding:11px}
        #expenseList .v205-expense-category-pill{max-width:140px}
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

  function paymentExpenseLists(){
    const current = monthKey();
    const previous = previousMonthKey();
    const all = state.expenses.map(normalizeExpense);

    return {
      current: all.filter(x => x.date?.startsWith(current)),
      previous: all.filter(x => x.date?.startsWith(previous)),
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
        <small id="v176PayCurrentCount">0 işlem</small>
      </article>
      <article class="v175-quick-card" data-payment-quick="previous" role="button" tabindex="0">
        <span>GEÇEN AY</span>
        <strong id="v176PayPreviousAmount">₺0</strong>
        <small id="v176PayPreviousCount">0 işlem</small>
      </article>
      <article class="v175-quick-card" data-payment-quick="all" role="button" tabindex="0">
        <span>TÜMÜ</span>
        <strong id="v176PayAllAmount">₺0</strong>
        <small id="v176PayAllCount">0 işlem</small>
      </article>
    `;
    title.insertAdjacentElement('afterend', wrap);

    const apply = mode => {
      const period = document.querySelector('#paymentPeriodFilter');
      if(period) period.value = mode;
      paymentViewMode = 'all';
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

  function ensurePaymentTypeCards(){
    ensurePaymentQuickCards();
    const periodKpis = document.querySelector('#v176PaymentKpis');
    if(!periodKpis || document.querySelector('#v176PaymentTypeKpis')) return;

    const wrap = document.createElement('div');
    wrap.id = 'v176PaymentTypeKpis';
    wrap.innerHTML = `
      <article class="v175-quick-card" data-payment-view="payments" role="button" tabindex="0" aria-pressed="false">
        <span>TAKSİTLER</span>
        <strong id="v176PaymentTypePaymentAmount">₺0</strong>
        <small id="v176PaymentTypePaymentCount">0 taksit ödemesi</small>
      </article>
      <article class="v175-quick-card" data-payment-view="expenses" role="button" tabindex="0" aria-pressed="false">
        <span>HARCAMALAR</span>
        <strong id="v176PaymentTypeExpenseAmount">₺0</strong>
        <small id="v176PaymentTypeExpenseCount">0 harcama</small>
      </article>
    `;
    periodKpis.insertAdjacentElement('afterend',wrap);

    const activate = mode => {
      paymentViewMode = mode === 'expenses' ? 'expenses' : 'payments';
      renderPayments();
    };

    wrap.addEventListener('click',e=>{
      const card=e.target.closest('[data-payment-view]');
      if(card) activate(card.dataset.paymentView);
    });

    wrap.addEventListener('keydown',e=>{
      const card=e.target.closest('[data-payment-view]');
      if(!card || !['Enter',' '].includes(e.key)) return;
      e.preventDefault();
      activate(card.dataset.paymentView);
    });
  }

  function updatePaymentQuickCards(){
    ensurePaymentQuickCards();
    const payments = paymentLists();
    const expenses = paymentExpenseLists();
    const period = document.querySelector('#paymentPeriodFilter')?.value || 'current';

    const data = [
      ['current','#v176PayCurrentAmount','#v176PayCurrentCount'],
      ['previous','#v176PayPreviousAmount','#v176PayPreviousCount'],
      ['all','#v176PayAllAmount','#v176PayAllCount']
    ];

    data.forEach(([key, amountSel, countSel]) => {
      const paymentList = payments[key];
      const expenseList = expenses[key];
      const total =
        paymentList.reduce((s,p)=>s+(+p.amount||0),0) +
        expenseList.reduce((s,x)=>s+(+x.amount||0),0);
      const countValue = paymentList.length + expenseList.length;
      const amount = document.querySelector(amountSel);
      const count = document.querySelector(countSel);
      if(amount) amount.textContent = money(total);
      if(count) count.textContent = `${countValue} işlem`;
    });

    document.querySelectorAll('[data-payment-quick]').forEach(card => {
      const active = card.dataset.paymentQuick === period;
      card.classList.toggle('active', active);
      card.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function updatePaymentTypeCards(){
    ensurePaymentTypeCards();
    const period = document.querySelector('#paymentPeriodFilter')?.value || 'current';
    const payments = paymentLists()[period] || [];
    const expenses = paymentExpenseLists()[period] || [];

    const paymentAmount = document.querySelector('#v176PaymentTypePaymentAmount');
    const paymentCount = document.querySelector('#v176PaymentTypePaymentCount');
    const expenseAmount = document.querySelector('#v176PaymentTypeExpenseAmount');
    const expenseCount = document.querySelector('#v176PaymentTypeExpenseCount');

    if(paymentAmount) paymentAmount.textContent = money(payments.reduce((s,p)=>s+(+p.amount||0),0));
    if(paymentCount) paymentCount.textContent = `${payments.length} taksit ödemesi`;
    if(expenseAmount) expenseAmount.textContent = money(expenses.reduce((s,x)=>s+(+x.amount||0),0));
    if(expenseCount) expenseCount.textContent = `${expenses.length} harcama`;

    document.querySelectorAll('[data-payment-view]').forEach(card=>{
      const active = card.dataset.paymentView === paymentViewMode;
      card.classList.toggle('active',active);
      card.setAttribute('aria-pressed',active?'true':'false');
    });
  }

  function updatePaymentAction(){
    const button = document.querySelector('#addPaymentBtn');
    if(!button) return;

    if(paymentViewMode === 'expenses'){
      button.textContent = '＋ Harcama';
      button.onclick = () => openRecordDialog('expenses');
    }else{
      button.textContent = '＋ Ödeme';
      button.onclick = () => openRecordDialog('payments');
    }
  }

  function renderPaymentsV176(){
    ensurePaymentQuickCards();
    ensurePaymentTypeCards();

    const period = document.querySelector('#paymentPeriodFilter')?.value || 'current';
    const paymentList = paymentLists()[period] || [];
    const expenseList = paymentExpenseLists()[period] || [];
    let rows = [];

    if(paymentViewMode === 'payments'){
      rows = paymentList.map(item => ({kind:'payment',item}));
    }else if(paymentViewMode === 'expenses'){
      rows = expenseList.map(item => ({kind:'expense',item}));
    }else{
      rows = [
        ...paymentList.map(item => ({kind:'payment',item})),
        ...expenseList.map(item => ({kind:'expense',item}))
      ];
    }

    rows.sort((a,b) => `${b.item.date}${b.item.createdAt}`.localeCompare(`${a.item.date}${a.item.createdAt}`));

    const listEl = document.querySelector('#paymentList');
    if(listEl){
      if(rows.length){
        listEl.innerHTML = rows.map(row => row.kind === 'expense' ? expenseCard(row.item) : paymentCard(row.item)).join('');
      }else if(paymentViewMode === 'expenses'){
        listEl.innerHTML = empty(
          period === 'current'
            ? 'Bu ay harcama kaydı yok.'
            : period === 'previous'
              ? 'Geçen ay harcama kaydı yok.'
              : 'Henüz harcama kaydı yok.'
        );
      }else if(paymentViewMode === 'payments'){
        listEl.innerHTML = empty(
          period === 'current'
            ? 'Bu ay henüz ödeme kaydı yok.'
            : period === 'previous'
              ? 'Geçen ay ödeme kaydı yok.'
              : 'Henüz borç ödemesi yok.'
        );
      }else{
        listEl.innerHTML = empty(
          period === 'current'
            ? 'Bu ay ödeme veya harcama kaydı yok.'
            : period === 'previous'
              ? 'Geçen ay ödeme veya harcama kaydı yok.'
              : 'Henüz ödeme veya harcama kaydı yok.'
        );
      }
    }

    updatePaymentQuickCards();
    updatePaymentTypeCards();
    updatePaymentAction();
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
      const category=x.category || 'Diğer';
      totals.set(category, (totals.get(category) || 0) + (+x.amount || 0));
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

  function ensureExpenseCategorySummary(){
    const view=document.querySelector('#expenses');
    const kpis=document.querySelector('#v176ExpenseKpis');
    const toolbar=view?.querySelector('.toolbar');
    if(!view || !kpis || !toolbar) return null;

    let wrap=document.querySelector('#v203ExpenseCategorySummary');
    if(wrap) return wrap;

    wrap=document.createElement('section');
    wrap.id='v203ExpenseCategorySummary';
    wrap.innerHTML=`
      <div class="v203-expense-category-head">
        <strong>Kategori Özeti</strong>
        <button type="button" class="v203-expense-category-reset" data-expense-category="all">Tümünü Göster</button>
      </div>
      <div id="v203ExpenseCategoryList"></div>
    `;
    kpis.insertAdjacentElement('afterend',wrap);

    wrap.addEventListener('click',e=>{
      const btn=e.target.closest('[data-expense-category]');
      if(!btn) return;

      const select=document.querySelector('#v176ExpenseCategoryFilter');
      const search=document.querySelector('#expenseSearch');
      if(!select) return;

      const requested=btn.dataset.expenseCategory || 'all';
      const next=requested!=='all' && select.value===requested ? 'all' : requested;
      select.value=next;
      expenseQuickMode=next==='all'?'all':'category';
      if(search) search.value='';
      renderExpenses();
    });

    return wrap;
  }

  function renderExpenseCategorySummary(monthList){
    ensureExpenseCategorySummary();
    const listEl=document.querySelector('#v203ExpenseCategoryList');
    if(!listEl) return;

    const rows=expenseCategoryTotals(monthList);
    const total=monthList.reduce((s,x)=>s+(+x.amount||0),0);
    const active=document.querySelector('#v176ExpenseCategoryFilter')?.value || 'all';

    if(!rows.length || total<=0){
      listEl.innerHTML='<div class="v203-expense-category-empty">Seçili ayda kategori özeti oluşturacak harcama yok.</div>';
      return;
    }

    listEl.innerHTML=rows.slice(0,5).map(([category,amount])=>{
      const ratio=Math.max(0,Math.min(100,(amount/total)*100));
      const isActive=active===category;
      return `
        <button type="button" class="v203-expense-category-row${isActive?' active':''}" data-expense-category="${esc(category)}" aria-pressed="${isActive?'true':'false'}">
          <span class="v203-expense-category-name">${esc(category)} · %${Math.round(ratio)}</span>
          <span class="v203-expense-category-amount">${money(amount)}</span>
          <span class="v203-expense-category-track" aria-hidden="true"><span style="width:${ratio.toFixed(1)}%"></span></span>
        </button>
      `;
    }).join('');
  }

  function decorateExpenseCards(list){
    const byId=new Map(list.map(x=>[x.id,x]));
    document.querySelectorAll('#expenseList [data-expense]').forEach(card=>{
      const x=byId.get(card.dataset.expense);
      if(!x) return;

      const small=card.querySelector('.main small');
      if(small){
        small.className='v205-expense-meta';
        small.innerHTML=`
          <span class="v205-expense-date">${parseDate(x.date).toLocaleDateString('tr-TR')}</span>
          <span class="v205-expense-category-pill">${esc(x.category||'Diğer')}</span>
          ${x.addedBy?`<span class="v205-expense-added">${esc(x.addedBy)}</span>`:''}
        `;
      }

      const method=card.querySelector('.amount small');
      if(method){
        method.className='v205-expense-method';
        method.textContent=x.method||'—';
      }
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
    ensureExpenseCategorySummary();

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

      decorateExpenseCards(list);
    }

    updateExpenseQuickCards(monthList);
    renderExpenseCategorySummary(monthList);
  }

  ensureV176Styles();
  ensurePaymentQuickCards();
  ensurePaymentTypeCards();
  ensureExpenseCategoryFilter();
  ensureExpenseQuickCards();
  ensureExpenseCategorySummary();

  renderPayments = renderPaymentsV176;
  renderExpenses = renderExpensesV176;

  const originalOpenViewV176 = openView;
  openView = function(view){
    const enteringPayments = view === 'payments' && activeView !== 'payments';
    if(enteringPayments) paymentViewMode = 'all';
    originalOpenViewV176(view);
    if(view === 'payments') renderPayments();
  };

  const paymentPeriod = document.querySelector('#paymentPeriodFilter');
  if(paymentPeriod) paymentPeriod.onchange = () => {
    paymentViewMode = 'all';
    renderPayments();
  };

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
})();