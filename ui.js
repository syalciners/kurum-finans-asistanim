/* BS OFİS BÜTÇE V2.5.7 - Sade arayüz davranış katmanı
   Marka, tipografi ve görsel stiller CSS dosyalarında yönetilir. */
(() => {
  if(window.__bsCurrentUiLoaded) return;
  window.__bsCurrentUiLoaded = true;

  const ICONS = {
    income:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M8.7 10h4.7a2 2 0 0 1 0 4h-2.8a2 2 0 0 0 0 4H16"/></svg>',
    due:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M7 11h10M8 15h3"/></svg>',
    paid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.1 2.4 2.4 5.3-5.4"/></svg>',
    remaining:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10M7 20h10M8 4c0 4 8 4 8 8s-8 4-8 8"/></svg>',
    sort:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h12M4 12h8M4 17h4"/><path d="m17 15 3 3 3-3"/></svg>'
  };

  // payment-plan.js eski sürümlerde bu işaretin varlığını hazır olma sinyali olarak kullanıyor.
  // Görsel kural taşımaz; V257 sonrasında yalnız uyumluluk işaretidir.
  function ensureCompatibilityMarker(){
    if(document.querySelector('#bsCurrentUiStyles')) return;
    const marker = document.createElement('style');
    marker.id = 'bsCurrentUiStyles';
    marker.dataset.compatMarker = 'v257';
    document.head.appendChild(marker);
  }

  function upgradeSummaryCards(){
    const cards = [...document.querySelectorAll('#dashboard .summary-grid .summary-card')];
    const kinds = ['income','due','paid','remaining'];

    cards.forEach((card,index) => {
      if(card.querySelector('.bs-summary-head')) return;

      const label = card.querySelector(':scope > span');
      if(!label) return;

      const head = document.createElement('div');
      head.className = 'bs-summary-head';
      head.innerHTML = `<span class="bs-summary-icon" aria-hidden="true">${ICONS[kinds[index]] || ICONS.income}</span><span class="bs-summary-label">${label.textContent}</span>`;
      label.replaceWith(head);
    });
  }

  function reorderDashboard(){
    const summary = document.querySelector('#dashboard .summary-grid');
    const quick = document.querySelector('#v178QuickActions');
    const panel = document.querySelector('#v177DashboardPanel');
    if(!summary || !quick || !panel) return;

    if(summary.nextElementSibling !== quick){
      summary.insertAdjacentElement('afterend',quick);
    }
    if(quick.nextElementSibling !== panel){
      quick.insertAdjacentElement('afterend',panel);
    }
  }

  function applyExpenseUx(){
    const netCashLabel = document.querySelector('#v177BalanceCard .v177-balance-main > span');
    if(netCashLabel){
      netCashLabel.textContent = 'BU AY NET NAKİT AKIŞI';
    }

    const expenseFlow = document.querySelector('[data-v177-flow="expenses"]');
    if(expenseFlow){
      expenseFlow.title = 'Harcamaları görüntüle';
      expenseFlow.setAttribute('aria-label','Bu ayın harcamalarını görüntüle');
    }

    const expenseCount = document.querySelector('#v177ExpenseCount');
    if(expenseCount){
      const base = expenseCount.textContent
        .replace(/\s*·\s*Aç\s*›?\s*$/u,'')
        .trim();
      expenseCount.textContent = `${base} · Aç ›`;
    }
  }

  function calendarGroupHtml(title,items){
    if(!items.length) return '';
    const total = items.reduce((sum,item) => sum + (+item.amount || 0),0);
    return `
      <div class="v175-calendar-group">
        <strong>${esc(title)}</strong>
        <small>${items.length} kayıt · ${money(total)}</small>
      </div>
      ${items.map(dueCard).join('')}
    `;
  }

  function sortCalendarItems(items,mode){
    const list = [...items];
    if(mode === 'amount'){
      return list.sort((a,b) => (+b.amount || 0) - (+a.amount || 0) || a.days - b.days);
    }
    return list.sort((a,b) => a.days - b.days || (+b.amount || 0) - (+a.amount || 0));
  }

  function applyCalendarSort(){
    const list = document.querySelector('#calendarList');
    if(!list || typeof dueItems !== 'function' || typeof dueCard !== 'function') return;

    const activeMode = document.querySelector('[data-calendar-quick].active')?.dataset.calendarQuick || 'all';
    const sortMode = document.querySelector('#bsCalendarSortSelect')?.value || 'due';
    const due = dueItems();

    let filtered = due;
    if(activeMode === 'overdue') filtered = due.filter(item => item.days < 0);
    if(activeMode === 'week') filtered = due.filter(item => item.days >= 0 && item.days <= 7);
    if(!filtered.length) return;

    const overdue = sortCalendarItems(filtered.filter(item => item.days < 0),sortMode);
    const today = sortCalendarItems(filtered.filter(item => item.days === 0),sortMode);
    const week = sortCalendarItems(filtered.filter(item => item.days > 0 && item.days <= 7),sortMode);
    const later = sortCalendarItems(filtered.filter(item => item.days > 7),sortMode);

    list.innerHTML =
      calendarGroupHtml('Geciken',overdue) +
      calendarGroupHtml('Bugün',today) +
      calendarGroupHtml('Önümüzdeki 7 Gün',week) +
      calendarGroupHtml('Daha Sonra',later);
  }

  function ensureCalendarSort(){
    const calendar = document.querySelector('#calendar');
    const kpis = document.querySelector('#v175CalendarKpis');
    if(!calendar || !kpis) return null;

    let wrap = document.querySelector('#bsCalendarSort');
    if(wrap) return wrap;

    wrap = document.createElement('div');
    wrap.id = 'bsCalendarSort';
    wrap.className = 'bs-calendar-sort';
    wrap.innerHTML = `
      <label>
        <span class="bs-calendar-sort-icon" aria-hidden="true">${ICONS.sort}</span>
        <span class="bs-calendar-sort-copy">
          <small>Sırala</small>
          <select id="bsCalendarSortSelect" aria-label="Takvim sıralaması">
            <option value="due">Vade Tarihine Göre</option>
            <option value="amount">Tutara Göre</option>
          </select>
        </span>
      </label>
    `;
    kpis.insertAdjacentElement('afterend',wrap);
    wrap.querySelector('select')?.addEventListener('change',applyCalendarSort);
    return wrap;
  }

  function applyCurrentUi(){
    ensureCompatibilityMarker();
    upgradeSummaryCards();
    reorderDashboard();
    applyExpenseUx();
    ensureCalendarSort();
    applyCalendarSort();

    if(typeof renderDashboard === 'function' && !renderDashboard.__bsV257UiWrapped){
      const original = renderDashboard;
      const wrapped = function(){
        original();
        upgradeSummaryCards();
        reorderDashboard();
        applyExpenseUx();
      };
      wrapped.__bsV257UiWrapped = true;
      renderDashboard = wrapped;
    }

    if(typeof renderCalendar === 'function' && !renderCalendar.__bsV257UiWrapped){
      const original = renderCalendar;
      const wrapped = function(){
        original();
        ensureCalendarSort();
        applyCalendarSort();
      };
      wrapped.__bsV257UiWrapped = true;
      renderCalendar = wrapped;
    }

    window.__bsCurrentUiReady = true;
  }

  applyCurrentUi();
})();
