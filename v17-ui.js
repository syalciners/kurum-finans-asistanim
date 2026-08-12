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
      .income-distribution{
        display:block;
        margin-top:4px;
        color:#536078!important;
        line-height:1.35;
      }
      .income-bs-card{
        cursor:default;
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

  function updateOwnerCards(monthList){
    ensureOwnerCards();

    const totals = Object.fromEntries(ownerOrder.map(owner => [owner, 0]));

    monthList.forEach(x => {
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

  function ownerShortName(owner){
    return owner === 'Kurum Kasası' ? 'Kurum' : owner;
  }

  function isBsIncome(x){
    return !!(
      x.sourceRecordId &&
      (x.automatic || x.source)
    );
  }

  function groupIncomeRows(rows){
    const groups = new Map();

    rows.forEach(x => {
      if(!isBsIncome(x)){
        groups.set('manual:' + x.id, {
          kind:'manual',
          key:'manual:' + x.id,
          rows:[x],
          date:x.date,
          createdAt:x.createdAt || '',
          type:x.type,
          student:x.student,
          amount:Number(x.amount) || 0,
          owners:[x.owner]
        });
        return;
      }

      const key = 'bs:' + x.sourceRecordId;

      if(!groups.has(key)){
        groups.set(key, {
          kind:'bs',
          key,
          sourceRecordId:x.sourceRecordId,
          rows:[],
          date:x.date,
          createdAt:x.createdAt || '',
          type:x.type,
          student:x.student,
          amount:0,
          owners:[]
        });
      }

      const g = groups.get(key);
      g.rows.push(x);
      g.amount += Number(x.amount) || 0;
      g.owners.push(x.owner);

      if((x.createdAt || '') > g.createdAt){
        g.createdAt = x.createdAt || '';
      }
    });

    return [...groups.values()].map(g => ({
      ...g,
      owners:[...new Set(g.owners)]
    }));
  }

  function bsIncomeCard(group){
    const ownerTotals = {};

    group.rows.forEach(x => {
      ownerTotals[x.owner] =
        (ownerTotals[x.owner] || 0) +
        (Number(x.amount) || 0);
    });

    const distribution = ownerOrder
      .filter(owner => (ownerTotals[owner] || 0) > 0)
      .map(owner => `${ownerShortName(owner)} ${money(ownerTotals[owner])}`)
      .join(' · ');

    const lesson =
      group.type === 'Özel Ders' && group.student
        ?` · ${group.student}`
        :'';

    return `
      <article class="list-card income-bs-card">
        <div class="main">
          <strong>${esc(group.type)}${esc(lesson)}</strong>
          <small>
            ${parseDate(group.date).toLocaleDateString('tr-TR')} · BS Ofis
          </small>
          <small class="income-distribution">
            Dağılım: ${esc(distribution)}
          </small>
        </div>

        <div class="amount">
          ${money(group.amount)}
        </div>
      </article>
    `;
  }

  function groupedIncomeCard(group){
    if(group.kind === 'bs'){
      return bsIncomeCard(group);
    }

    return incomeCard(group.rows[0]);
  }

  function renderIncomesV17(){
    populateIncomeMonths();

    const month = document.querySelector('#incomeMonth')?.value || monthKey();
    const owner = document.querySelector('#incomeOwnerFilter')?.value || 'all';
    const type = document.querySelector('#incomeTypeFilter')?.value || 'all';

    const monthList = state.incomes
      .map(normalizeIncome)
      .filter(x => x.date?.startsWith(month));

    document.querySelector('#incomeMonthlyTotal').textContent =
      money(monthList.reduce((s,x) => s + x.amount, 0));

    document.querySelector('#incomeLessonTotal').textContent =
      money(
        monthList
          .filter(x => x.type === 'Özel Ders')
          .reduce((s,x) => s + x.amount, 0)
      );

    updateOwnerCards(monthList);

    const grouped = groupIncomeRows(monthList)
      .filter(g =>
        (owner === 'all' || g.owners.includes(owner)) &&
        (type === 'all' || g.type === type)
      )
      .sort((a,b) =>
        `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`)
      );

    document.querySelector('#incomeList').innerHTML =
      grouped.length
        ? grouped.map(groupedIncomeCard).join('')
        : empty('Bu filtrede gelir kaydı yok.');
  }

  ensureOwnerCardStyles();
  ensureOwnerCards();

  renderIncomes = renderIncomesV17;

  const ownerFilter = document.querySelector('#incomeOwnerFilter');
  const typeFilter = document.querySelector('#incomeTypeFilter');
  const monthFilter = document.querySelector('#incomeMonth');

  if(ownerFilter) ownerFilter.onchange = renderIncomes;
  if(typeFilter) typeFilter.onchange = renderIncomes;
  if(monthFilter) monthFilter.onchange = renderIncomes;

  renderIncomes();
})();