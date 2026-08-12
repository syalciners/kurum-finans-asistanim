/* BS OFİS BÜTÇE V1.7 - Gelir ekranı ek görünüm */
(() => {
  const originalMergeAppConfigV17 = mergeAppConfig;

  mergeAppConfig = function(raw={}){
    const cfg = originalMergeAppConfigV17(raw);
    cfg.schemaVersion = 16;
    return cfg;
  };

  if(appConfig && appConfig.schemaVersion !== 16){
    appConfig.schemaVersion = 16;
    saveAppConfig(false);
  }

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
      <article class="income-owner-kpi" data-owner-kpi="Başak" role="button" tabindex="0" aria-label="Başak gelirlerini filtrele">
        <span>Başak</span>
        <strong id="incomeOwnerBasak">₺0</strong>
      </article>
      <article class="income-owner-kpi" data-owner-kpi="Süleyman" role="button" tabindex="0" aria-label="Süleyman gelirlerini filtrele">
        <span>Süleyman</span>
        <strong id="incomeOwnerSuleyman">₺0</strong>
      </article>
      <article class="income-owner-kpi" data-owner-kpi="Kurum Kasası" role="button" tabindex="0" aria-label="Kurum gelirlerini filtrele">
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
        cursor:pointer;
        transition:border-color .15s ease, background .15s ease, transform .15s ease;
        -webkit-tap-highlight-color:transparent;
      }
      .income-owner-kpi:active,
      .income-bs-card:active{
        transform:scale(.985);
      }
      .income-owner-kpi.active{
        border-color:#8eb1ff;
        background:#eef4ff;
        box-shadow:0 0 0 2px rgba(36,107,253,.08);
      }
      .income-owner-kpi:focus-visible,
      .income-bs-card:focus-visible{
        outline:2px solid #8eb1ff;
        outline-offset:2px;
      }
      .income-owner-kpi span{
        color:var(--muted);
        font-size:11px;
        font-weight:700;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      .income-owner-kpi.active span,
      .income-owner-kpi.active strong{
        color:var(--accent);
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
        cursor:pointer;
        transition:transform .15s ease;
        -webkit-tap-highlight-color:transparent;
      }
      .income-share-note{
        display:block;
        margin-top:4px;
        color:var(--accent)!important;
        font-weight:700;
        line-height:1.35;
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
    const activeOwner = document.querySelector('#incomeOwnerFilter')?.value || 'all';

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

    document.querySelectorAll('[data-owner-kpi]').forEach(card => {
      const active = card.dataset.ownerKpi === activeOwner;
      card.classList.toggle('active', active);
      card.setAttribute('aria-pressed', active ? 'true' : 'false');
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

  function ownerTotalsForGroup(group){
    const totals = {};

    group.rows.forEach(x => {
      totals[x.owner] =
        (totals[x.owner] || 0) +
        (Number(x.amount) || 0);
    });

    return totals;
  }

  function distributionText(group){
    const ownerTotals = ownerTotalsForGroup(group);

    return ownerOrder
      .filter(owner => (ownerTotals[owner] || 0) > 0)
      .map(owner => `${ownerShortName(owner)} ${money(ownerTotals[owner])}`)
      .join(' · ');
  }

  function bsIncomeCard(group, activeOwner='all'){
    const ownerTotals = ownerTotalsForGroup(group);
    const filteredShare = activeOwner !== 'all'
      ? Number(ownerTotals[activeOwner]) || 0
      : group.amount;

    const lesson =
      group.type === 'Özel Ders' && group.student
        ?` · ${group.student}`
        :'';

    const detailLine = activeOwner === 'all'
      ? `Dağılım: ${distributionText(group)}`
      : `${ownerShortName(activeOwner)} payı: ${money(filteredShare)} · Tahsilat toplamı: ${money(group.amount)}`;

    return `
      <article
        class="list-card income-bs-card"
        data-bs-payment="${esc(group.sourceRecordId)}"
        role="button"
        tabindex="0"
        aria-label="${esc(group.student || group.type)} tahsilat detayını aç"
      >
        <div class="main">
          <strong>${esc(group.type)}${esc(lesson)}</strong>
          <small>
            ${parseDate(group.date).toLocaleDateString('tr-TR')} · BS Ofis
          </small>
          <small class="${activeOwner === 'all' ? 'income-distribution' : 'income-share-note'}">
            ${esc(detailLine)}
          </small>
        </div>

        <div class="amount">
          ${money(filteredShare)}
        </div>
      </article>
    `;
  }

  function groupedIncomeCard(group, activeOwner='all'){
    if(group.kind === 'bs'){
      return bsIncomeCard(group, activeOwner);
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
        ? grouped.map(g => groupedIncomeCard(g, owner)).join('')
        : empty('Bu filtrede gelir kaydı yok.');
  }

  function toggleOwnerFilter(owner){
    const ownerFilter = document.querySelector('#incomeOwnerFilter');
    if(!ownerFilter){
      return;
    }

    ownerFilter.value = ownerFilter.value === owner ? 'all' : owner;
    renderIncomes();
  }

  function bindOwnerCardActions(){
    const wrap = document.querySelector('#incomeOwnerKpis');
    if(!wrap || wrap.dataset.bound === '1'){
      return;
    }

    wrap.dataset.bound = '1';

    wrap.addEventListener('click', e => {
      const card = e.target.closest('[data-owner-kpi]');
      if(card){
        toggleOwnerFilter(card.dataset.ownerKpi);
      }
    });

    wrap.addEventListener('keydown', e => {
      const card = e.target.closest('[data-owner-kpi]');
      if(!card || !['Enter', ' '].includes(e.key)){
        return;
      }

      e.preventDefault();
      toggleOwnerFilter(card.dataset.ownerKpi);
    });
  }

  function findBsGroup(paymentId){
    return groupIncomeRows(
      state.incomes.map(normalizeIncome)
    ).find(g => g.kind === 'bs' && g.sourceRecordId === paymentId);
  }

  function openBsIncomeDetail(group){
    if(!group){
      return;
    }

    const ownerTotals = ownerTotalsForGroup(group);
    const rows = [
      ['Öğrenci', group.student || '—'],
      ['Tahsilat tarihi', parseDate(group.date).toLocaleDateString('tr-TR')],
      ['Toplam tahsilat', money(group.amount)]
    ];

    ownerOrder.forEach(owner => {
      if((ownerTotals[owner] || 0) > 0){
        rows.push([ownerShortName(owner) + ' payı', money(ownerTotals[owner])]);
      }
    });

    rows.push(['Kaynak', 'BS Ofis']);

    const dialog = document.querySelector('#detailDialog');
    const content = document.querySelector('#detailContent');

    if(!dialog || !content){
      return;
    }

    content.innerHTML = `
      <div class="dialog-head">
        <div>
          <p class="eyebrow">BS OFİS TAHSİLATI</p>
          <h3>${esc(group.student || group.type)}</h3>
        </div>
        <button type="button" class="icon-btn close-detail">×</button>
      </div>
      <div class="detail-grid">
        ${rows.map(([label,value]) => `
          <div class="detail-row">
            <span>${esc(label)}</span>
            <strong>${esc(value)}</strong>
          </div>
        `).join('')}
      </div>
      <p class="muted">Bu kayıt BS Ofis'ten otomatik gelir. Finans uygulamasında düzenlenmez veya silinmez.</p>
    `;

    dialog.showModal();
  }

  function bindBsIncomeDetails(){
    const list = document.querySelector('#incomeList');
    if(!list || list.dataset.bsDetailBound === '1'){
      return;
    }

    list.dataset.bsDetailBound = '1';

    const openFromTarget = target => {
      const card = target.closest('[data-bs-payment]');
      if(!card){
        return;
      }
      openBsIncomeDetail(findBsGroup(card.dataset.bsPayment));
    };

    list.addEventListener('click', e => openFromTarget(e.target));

    list.addEventListener('keydown', e => {
      if(!['Enter', ' '].includes(e.key)){
        return;
      }
      const card = e.target.closest('[data-bs-payment]');
      if(!card){
        return;
      }
      e.preventDefault();
      openBsIncomeDetail(findBsGroup(card.dataset.bsPayment));
    });
  }

  function bindAutomaticIncomeGuards(){
    const originalOpenIncomeDialogV17 = openIncomeDialog;

    openIncomeDialog = function(income={}){
      const normalized = normalizeIncome(income);

      if(normalized.id && isBsIncome(normalized)){
        openBsIncomeDetail(findBsGroup(normalized.sourceRecordId));
        return;
      }

      return originalOpenIncomeDialogV17(income);
    };

    const deleteBtn = document.querySelector('#deleteIncomeBtn');

    if(
      deleteBtn &&
      deleteBtn.onclick &&
      deleteBtn.dataset.v17Guard !== '1'
    ){
      const originalDeleteIncomeV17 = deleteBtn.onclick;
      deleteBtn.dataset.v17Guard = '1';

      deleteBtn.onclick = async() => {
        const id = document.querySelector('#incomeForm [name="id"]')?.value || '';
        const income = state.incomes
          .map(normalizeIncome)
          .find(x => x.id === id);

        if(income && isBsIncome(income)){
          toast('BS Ofis gelirleri Finans uygulamasından silinmez.');
          return;
        }

        return originalDeleteIncomeV17();
      };
    }
  }

  ensureOwnerCardStyles();
  ensureOwnerCards();
  bindOwnerCardActions();
  bindBsIncomeDetails();
  bindAutomaticIncomeGuards();

  renderIncomes = renderIncomesV17;

  const ownerFilter = document.querySelector('#incomeOwnerFilter');
  const typeFilter = document.querySelector('#incomeTypeFilter');
  const monthFilter = document.querySelector('#incomeMonth');

  if(ownerFilter) ownerFilter.onchange = renderIncomes;
  if(typeFilter) typeFilter.onchange = renderIncomes;
  if(monthFilter) monthFilter.onchange = renderIncomes;

  renderIncomes();

  // V1.7.4 - Büyük gelir KPI kartları da hızlı filtre olarak çalışır.
  const monthlyKpiCard = document.querySelector('#incomeMonthlyTotal')?.closest('.kpi');
  const lessonKpiCard = document.querySelector('#incomeLessonTotal')?.closest('.kpi');

  function ensureMainKpiStyles(){
    if(document.querySelector('#v174MainKpiStyles')){
      return;
    }

    const style = document.createElement('style');
    style.id = 'v174MainKpiStyles';
    style.textContent = `
      #incomes .kpi-grid > .kpi[data-income-main-filter]{
        cursor:pointer;
        transition:border-color .15s ease, background .15s ease, transform .15s ease, box-shadow .15s ease;
        -webkit-tap-highlight-color:transparent;
      }
      #incomes .kpi-grid > .kpi[data-income-main-filter]:active{
        transform:scale(.985);
      }
      #incomes .kpi-grid > .kpi[data-income-main-filter].active{
        border-color:#8eb1ff;
        background:#eef4ff;
        box-shadow:0 0 0 2px rgba(36,107,253,.08);
      }
      #incomes .kpi-grid > .kpi[data-income-main-filter].active span,
      #incomes .kpi-grid > .kpi[data-income-main-filter].active strong,
      #incomes .kpi-grid > .kpi[data-income-main-filter].active small{
        color:var(--accent);
      }
      #incomes .kpi-grid > .kpi[data-income-main-filter]:focus-visible{
        outline:2px solid #8eb1ff;
        outline-offset:2px;
      }
    `;
    document.head.appendChild(style);
  }

  function updateMainKpiState(){
    const owner = document.querySelector('#incomeOwnerFilter')?.value || 'all';
    const type = document.querySelector('#incomeTypeFilter')?.value || 'all';

    if(monthlyKpiCard){
      const active = owner === 'all' && type === 'all';
      monthlyKpiCard.classList.toggle('active', active);
      monthlyKpiCard.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    if(lessonKpiCard){
      const active = owner === 'all' && type === 'Özel Ders';
      lessonKpiCard.classList.toggle('active', active);
      lessonKpiCard.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  function applyMainIncomeFilter(mode){
    const owner = document.querySelector('#incomeOwnerFilter');
    const type = document.querySelector('#incomeTypeFilter');

    if(!owner || !type){
      return;
    }

    owner.value = 'all';
    type.value = mode === 'lesson' ? 'Özel Ders' : 'all';
    renderIncomes();
    updateMainKpiState();
  }

  function bindMainIncomeKpi(card, mode, label){
    if(!card || card.dataset.mainKpiBound === '1'){
      return;
    }

    card.dataset.mainKpiBound = '1';
    card.dataset.incomeMainFilter = mode;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', label);

    card.addEventListener('click', () => applyMainIncomeFilter(mode));
    card.addEventListener('keydown', e => {
      if(!['Enter', ' '].includes(e.key)){
        return;
      }
      e.preventDefault();
      applyMainIncomeFilter(mode);
    });
  }

  ensureMainKpiStyles();
  bindMainIncomeKpi(monthlyKpiCard, 'all', 'Seçili ayın tüm gelirlerini göster');
  bindMainIncomeKpi(lessonKpiCard, 'lesson', 'Seçili ayın özel ders gelirlerini göster');

  document.querySelector('#incomeOwnerFilter')?.addEventListener('change', updateMainKpiState);
  document.querySelector('#incomeTypeFilter')?.addEventListener('change', updateMainKpiState);
  document.querySelector('#incomeMonth')?.addEventListener('change', updateMainKpiState);
  document.querySelector('#incomeOwnerKpis')?.addEventListener('click', () => setTimeout(updateMainKpiState, 0));

  updateMainKpiState();

  // V1.7.5 modülünü mevcut V1.7 katmanından yükle.
  if(!document.querySelector('script[data-v175-loader]')){
    const script = document.createElement('script');
    script.src = 'v175-ui.js?v=175';
    script.dataset.v175Loader = '1';
    document.head.appendChild(script);
  }
})();