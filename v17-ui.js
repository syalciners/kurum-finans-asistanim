/* BS OFİS BÜTÇE V1.7 - Gelir ekranı ek görünüm */
(() => {
  const ownerOrder = ['Başak', 'Süleyman', 'Kurum Kasası'];
  const ownerIds = {
    'Başak': 'incomeOwnerBasak',
    'Süleyman': 'incomeOwnerSuleyman',
    'Kurum Kasası': 'incomeOwnerKurum'
  };

  function ensureOwnerCards(){
    const incomeView = document.querySelector('#incomes');
    const mainKpis = incomeView?.querySelector('.kpi-grid');

    if(!incomeView || !mainKpis || document.querySelector('#incomeOwnerKpis')){
      return;
    }

    const wrap = document.createElement('div');
    wrap.id = 'incomeOwnerKpis';
    wrap.className = 'income-owner-kpis';
    wrap.innerHTML = `
      <article class="income-owner-kpi">
        <span>Başak</span>
        <strong id="incomeOwnerBasak">₺0</strong>
      </article>
      <article class="income-owner-kpi">
        <span>Süleyman</span>
        <strong id="incomeOwnerSuleyman">₺0</strong>
      </article>
      <article class="income-owner-kpi">
        <span>Kurum</span>
        <strong id="incomeOwnerKurum">₺0</strong>
      </article>
    `;

    mainKpis.insertAdjacentElement('afterend', wrap);
  }

  function ensureOwnerCardStyles(){
    if(document.querySelector('#v17IncomeOwnerStyles')){
      return;
    }

    const style = document.createElement('style');
    style.id = 'v17IncomeOwnerStyles';
    style.textContent = `
      .income-owner-kpis{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:8px;
        margin:-10px 0 14px;
      }
      .income-owner-kpi{
        min-width:0;
        background:var(--card);
        border:1px solid var(--line);
        border-radius:13px;
        padding:10px 9px;
        display:grid;
        gap:4px;
        text-align:center;
        box-shadow:0 3px 12px rgba(20,33,61,.035);
      }
      .income-owner-kpi span{
        color:var(--muted);
        font-size:11px;
        font-weight:700;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      .income-owner-kpi strong{
        color:var(--ink);
        font-size:16px;
        line-height:1.15;
        white-space:nowrap;
      }
      @media(max-width:380px){
        .income-owner-kpis{gap:6px}
        .income-owner-kpi{padding:9px 6px}
        .income-owner-kpi span{font-size:10px}
        .income-owner-kpi strong{font-size:14px}
      }
    `;
    document.head.appendChild(style);
  }

  function updateOwnerCards(){
    ensureOwnerCards();

    const selectedMonth = document.querySelector('#incomeMonth')?.value || monthKey();
    const totals = Object.fromEntries(ownerOrder.map(owner => [owner, 0]));

    state.incomes
      .map(normalizeIncome)
      .filter(x => x.date?.startsWith(selectedMonth))
      .forEach(x => {
        if(Object.prototype.hasOwnProperty.call(totals, x.owner)){
          totals[x.owner] += Number(x.amount) || 0;
        }
      });

    ownerOrder.forEach(owner => {
      const el = document.querySelector('#' + ownerIds[owner]);
      if(el){
        el.textContent = money(totals[owner]);
      }
    });
  }

  ensureOwnerCardStyles();
  ensureOwnerCards();

  const originalRenderIncomes = renderIncomes;
  renderIncomes = function(){
    originalRenderIncomes();
    updateOwnerCards();
  };

  const ownerFilter = document.querySelector('#incomeOwnerFilter');
  const typeFilter = document.querySelector('#incomeTypeFilter');
  const monthFilter = document.querySelector('#incomeMonth');

  if(ownerFilter) ownerFilter.onchange = renderIncomes;
  if(typeFilter) typeFilter.onchange = renderIncomes;
  if(monthFilter) monthFilter.onchange = renderIncomes;

  renderIncomes();
})();
