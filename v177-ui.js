/* BS OFİS BÜTÇE V2.0.1 - Özet yönetim paneli */
(() => {
  function ensureV177Styles(){
    if(document.querySelector('#v177Styles')) return;

    const style = document.createElement('style');
    style.id = 'v177Styles';
    style.textContent = `
      .v177-dashboard-panel{
        display:grid;
        gap:10px;
        margin:-7px 0 18px;
      }
      .v177-balance-card{
        background:var(--card);
        border:1px solid var(--line);
        border-radius:18px;
        padding:15px 16px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:14px;
        box-shadow:0 4px 16px rgba(20,33,61,.04);
      }
      .v177-balance-main{
        min-width:0;
        display:grid;
        gap:4px;
      }
      .v177-balance-main span{
        color:var(--muted);
        font-size:10px;
        font-weight:800;
        letter-spacing:.06em;
      }
      .v177-balance-main strong{
        font-size:26px;
        line-height:1.05;
      }
      .v177-balance-main small{
        color:var(--muted);
        font-size:10px;
        line-height:1.25;
      }
      .v177-balance-card.positive .v177-balance-main strong{color:var(--success)}
      .v177-balance-card.negative .v177-balance-main strong{color:var(--danger)}
      .v177-balance-status{
        flex:0 0 auto;
        border-radius:999px;
        padding:6px 9px;
        font-size:9px;
        font-weight:800;
        background:#e6f7ef;
        color:var(--success);
      }
      .v177-balance-card.negative .v177-balance-status{
        background:#fdebec;
        color:var(--danger);
      }
      .v177-flow-grid{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:8px;
      }
      .v177-flow-card,
      .v177-attention-card{
        appearance:none;
        border:1px solid var(--line);
        background:var(--card);
        color:var(--ink);
        border-radius:13px;
        padding:10px 8px;
        display:grid;
        gap:3px;
        text-align:left;
        cursor:pointer;
        box-shadow:0 3px 12px rgba(20,33,61,.03);
        -webkit-tap-highlight-color:transparent;
        transition:transform .15s ease,border-color .15s ease,background .15s ease;
      }
      .v177-flow-card:active,
      .v177-attention-card:active{transform:scale(.985)}
      .v177-flow-card:hover,
      .v177-attention-card:hover{border-color:#b9cbef}
      .v177-flow-card:focus-visible,
      .v177-attention-card:focus-visible{
        outline:2px solid #8eb1ff;
        outline-offset:2px;
      }
      .v177-flow-card span,
      .v177-attention-card span{
        color:var(--muted);
        font-size:9px;
        font-weight:800;
        line-height:1.15;
      }
      .v177-flow-card strong{
        font-size:15px;
        line-height:1.15;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      .v177-flow-card small,
      .v177-attention-card small{
        color:var(--muted);
        font-size:9px;
        line-height:1.2;
      }
      .v177-attention-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin:4px 2px -2px;
      }
      .v177-attention-head strong{font-size:12px}
      .v177-attention-head small{font-size:10px;color:var(--muted)}
      .v177-attention-grid{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:8px;
      }
      .v177-attention-card{
        grid-template-columns:auto 1fr;
        align-items:center;
        text-align:left;
        padding:11px 12px;
      }
      .v177-attention-number{
        min-width:34px;
        height:34px;
        border-radius:10px;
        display:grid;
        place-items:center;
        background:#fff2dd;
        color:var(--orange);
        font-size:17px;
        font-weight:850;
      }
      .v177-attention-card.overdue .v177-attention-number{
        background:#fdebec;
        color:var(--danger);
      }
      .v177-attention-copy{display:grid;gap:2px;min-width:0}
      .v177-attention-copy strong{
        font-size:12px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      .v177-attention-empty{
        grid-column:1/-1;
        border:1px solid #dce9e3;
        background:#f1faf6;
        color:var(--success);
        border-radius:13px;
        padding:11px 12px;
        font-size:11px;
        font-weight:750;
      }

      /* V201: eski tekrar eden asistan bloğu kaldırılır, alt listeler sıkılaştırılır. */
      #dashboard .v201-hidden{display:none!important}
      #dashboard .section-head.v201-compact-head{
        margin:16px 2px 8px!important;
      }
      #dashboard .section-head.v201-compact-head h2{
        font-size:13px!important;
        font-weight:840!important;
        letter-spacing:-.02em!important;
      }
      #dashboard .section-head.v201-compact-head .link-btn{
        font-size:10px!important;
        font-weight:800!important;
      }
      #dashboard #upcomingMini,
      #dashboard #recentPayments{
        gap:7px!important;
      }
      #dashboard #upcomingMini .list-card,
      #dashboard #recentPayments .list-card{
        min-height:0!important;
        padding:11px 12px!important;
      }
      #dashboard #upcomingMini .list-card strong,
      #dashboard #recentPayments .list-card strong{
        font-size:12px!important;
      }
      #dashboard #upcomingMini .list-card small,
      #dashboard #recentPayments .list-card small{
        font-size:9px!important;
      }
      #dashboard #upcomingMini .list-card .amount,
      #dashboard #recentPayments .list-card .amount{
        font-size:13px!important;
      }

      @media(max-width:380px){
        .v177-balance-card{padding:13px}
        .v177-balance-main strong{font-size:23px}
        .v177-flow-grid{gap:6px}
        .v177-flow-card{padding:9px 6px}
        .v177-flow-card strong{font-size:13px}
        .v177-attention-grid{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureDashboardPanel(){
    const dashboard = document.querySelector('#dashboard');
    const summary = dashboard?.querySelector('.summary-grid');
    if(!dashboard || !summary) return null;

    let panel = document.querySelector('#v177DashboardPanel');
    if(panel) return panel;

    panel = document.createElement('section');
    panel.id = 'v177DashboardPanel';
    panel.className = 'v177-dashboard-panel';
    panel.innerHTML = `
      <article id="v177BalanceCard" class="v177-balance-card positive">
        <div class="v177-balance-main">
          <span>BU AY GERÇEKLEŞEN NET NAKİT</span>
          <strong id="v177NetCash">₺0</strong>
          <small>Gelir − yapılan borç ödemeleri − harcamalar</small>
        </div>
        <span id="v177BalanceStatus" class="v177-balance-status">POZİTİF</span>
      </article>

      <div class="v177-flow-grid">
        <button type="button" class="v177-flow-card" data-v177-flow="incomes">
          <span>GELİR</span>
          <strong id="v177Income">₺0</strong>
          <small id="v177IncomeCount">0 kayıt</small>
        </button>
        <button type="button" class="v177-flow-card" data-v177-flow="payments">
          <span>BORÇ ÖDEMESİ</span>
          <strong id="v177Payments">₺0</strong>
          <small id="v177PaymentCount">0 kayıt</small>
        </button>
        <button type="button" class="v177-flow-card" data-v177-flow="expenses">
          <span>HARCAMA</span>
          <strong id="v177Expenses">₺0</strong>
          <small id="v177ExpenseCount">0 kayıt</small>
        </button>
      </div>

      <div class="v177-attention-head">
        <strong>Dikkat Gerektirenler</strong>
        <small>vade takibi</small>
      </div>
      <div id="v177Attention" class="v177-attention-grid"></div>
    `;
    summary.insertAdjacentElement('afterend',panel);
    bindDashboardPanel(panel);
    return panel;
  }

  function visibleIncomeCount(incomes){
    const keys = new Set();
    incomes.forEach(x => {
      const bs = x.sourceRecordId && (x.automatic || x.source);
      keys.add(bs ? `bs:${x.sourceRecordId}` : `manual:${x.id}`);
    });
    return keys.size;
  }

  function currentMonthData(){
    const month = monthKey();
    const incomes = state.incomes
      .map(normalizeIncome)
      .filter(x => x.date?.startsWith(month));
    const payments = state.payments
      .map(normalizePayment)
      .filter(x => x.date?.startsWith(month));
    const expenses = state.expenses
      .map(normalizeExpense)
      .filter(x => x.date?.startsWith(month));

    const incomeTotal = incomes.reduce((s,x)=>s+(+x.amount||0),0);
    const paymentTotal = payments.reduce((s,x)=>s+(+x.amount||0),0);
    const expenseTotal = expenses.reduce((s,x)=>s+(+x.amount||0),0);

    return {
      incomes,payments,expenses,
      incomeCount:visibleIncomeCount(incomes),
      incomeTotal,paymentTotal,expenseTotal,
      net:incomeTotal-paymentTotal-expenseTotal
    };
  }

  function openCurrentIncome(){
    const month = document.querySelector('#incomeMonth');
    const owner = document.querySelector('#incomeOwnerFilter');
    const type = document.querySelector('#incomeTypeFilter');
    if(month) month.value = monthKey();
    if(owner) owner.value = 'all';
    if(type) type.value = 'all';
    renderIncomes();
    openView('incomes');
  }

  function openCurrentPayments(){
    const period = document.querySelector('#paymentPeriodFilter');
    if(period) period.value = 'current';
    renderPayments();
    openView('payments');
  }

  function openCurrentExpenses(){
    const month = document.querySelector('#expenseMonth');
    if(month){
      populateMonths();
      month.value = monthKey();
    }
    const category = document.querySelector('#v176ExpenseCategoryFilter');
    if(category) category.value = 'all';
    const search = document.querySelector('#expenseSearch');
    if(search) search.value = '';
    renderExpenses();
    openView('expenses');
  }

  function openCalendarMode(mode){
    openView('calendar');
    setTimeout(() => {
      const card = document.querySelector(`[data-calendar-quick="${mode}"]`);
      if(card) card.click();
    },0);
  }

  function bindDashboardPanel(panel){
    if(panel.dataset.bound === '1') return;
    panel.dataset.bound = '1';

    panel.addEventListener('click', e => {
      const flow = e.target.closest('[data-v177-flow]');
      if(flow){
        const mode = flow.dataset.v177Flow;
        if(mode === 'incomes') openCurrentIncome();
        else if(mode === 'payments') openCurrentPayments();
        else if(mode === 'expenses') openCurrentExpenses();
        return;
      }

      const attention = e.target.closest('[data-v177-attention]');
      if(attention){
        openCalendarMode(attention.dataset.v177Attention);
      }
    });
  }

  function renderAttention(){
    const el = document.querySelector('#v177Attention');
    if(!el) return;

    const due = dueItems();
    const overdue = due.filter(x => x.days < 0);
    const week = due.filter(x => x.days >= 0 && x.days <= 7);
    const overdueTotal = overdue.reduce((s,x)=>s+(+x.amount||0),0);
    const weekTotal = week.reduce((s,x)=>s+(+x.amount||0),0);

    if(!overdue.length && !week.length){
      el.innerHTML = '<div class="v177-attention-empty">Yakın vadede dikkat gerektiren ödeme bulunmuyor.</div>';
      return;
    }

    el.innerHTML = `
      ${overdue.length ? `
        <button type="button" class="v177-attention-card overdue" data-v177-attention="overdue">
          <span class="v177-attention-number">${overdue.length}</span>
          <span class="v177-attention-copy">
            <span>GECİKEN</span>
            <strong>${money(overdueTotal)}</strong>
            <small>takvimde göster</small>
          </span>
        </button>
      ` : ''}
      ${week.length ? `
        <button type="button" class="v177-attention-card" data-v177-attention="week">
          <span class="v177-attention-number">${week.length}</span>
          <span class="v177-attention-copy">
            <span>ÖNÜMÜZDEKİ 7 GÜN</span>
            <strong>${money(weekTotal)}</strong>
            <small>takvimde göster</small>
          </span>
        </button>
      ` : ''}
    `;
  }

  function compactLegacyDashboard(){
    const dashboard=document.querySelector('#dashboard');
    if(!dashboard) return;

    const assistant=document.querySelector('#assistantCard');
    if(assistant){
      assistant.classList.add('v201-hidden');
      const head=assistant.previousElementSibling;
      if(head?.classList?.contains('section-head')) head.classList.add('v201-hidden');
    }

    const upcoming=document.querySelector('#upcomingMini');
    const upcomingHead=upcoming?.previousElementSibling;
    if(upcomingHead?.classList?.contains('section-head')){
      upcomingHead.classList.add('v201-compact-head');
      const title=upcomingHead.querySelector('h2');
      const btn=upcomingHead.querySelector('.link-btn');
      if(title) title.textContent='Sıradaki Ödemeler';
      if(btn) btn.textContent='Takvim';
    }

    const recent=document.querySelector('#recentPayments');
    const recentHead=recent?.previousElementSibling;
    if(recentHead?.classList?.contains('section-head')){
      recentHead.classList.add('v201-compact-head');
      const title=recentHead.querySelector('h2');
      const btn=recentHead.querySelector('.link-btn');
      if(title) title.textContent='Son Ödemeler';
      if(btn) btn.textContent='Tümü';
    }

    // Ana ekranda uzun liste yerine en güncel 3 satır yeterli; tam liste ilgili modülde kalır.
    [upcoming,recent].forEach(list=>{
      if(!list) return;
      [...list.children].slice(3).forEach(node=>node.remove());
    });
  }

  function renderDashboardPanel(){
    ensureDashboardPanel();
    const data = currentMonthData();

    const balance = document.querySelector('#v177BalanceCard');
    const net = document.querySelector('#v177NetCash');
    const status = document.querySelector('#v177BalanceStatus');

    if(net) net.textContent = money(data.net);
    if(balance){
      balance.classList.toggle('positive',data.net >= 0);
      balance.classList.toggle('negative',data.net < 0);
    }
    if(status) status.textContent = data.net >= 0 ? 'POZİTİF' : 'AÇIK';

    const values = [
      ['#v177Income',money(data.incomeTotal)],
      ['#v177IncomeCount',`${data.incomeCount} gelir kaydı`],
      ['#v177Payments',money(data.paymentTotal)],
      ['#v177PaymentCount',`${data.payments.length} ödeme`],
      ['#v177Expenses',money(data.expenseTotal)],
      ['#v177ExpenseCount',`${data.expenses.length} harcama`]
    ];
    values.forEach(([selector,value]) => {
      const el = document.querySelector(selector);
      if(el) el.textContent = value;
    });

    renderAttention();
    compactLegacyDashboard();
  }

  ensureV177Styles();
  ensureDashboardPanel();

  const originalRenderDashboardV177 = renderDashboard;
  renderDashboard = function(){
    originalRenderDashboardV177();
    renderDashboardPanel();
  };

  renderDashboardPanel();

  // Hızlı işlemler modülünü mevcut zincirde yükle.
  if(!document.querySelector('script[data-v178-loader]')){
    const script = document.createElement('script');
    script.src = 'v178-ui.js?v=178';
    script.dataset.v178Loader = '1';
    document.head.appendChild(script);
  }
})();