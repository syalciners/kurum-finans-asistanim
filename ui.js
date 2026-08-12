/* BS OFİS BÜTÇE - TEK GÜNCEL ARAYÜZ KATMANI */
(() => {
  if (window.__bsCurrentUiLoaded) return;
  window.__bsCurrentUiLoaded = true;

  const ICONS = {
    income:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M8.7 10h4.7a2 2 0 0 1 0 4h-2.8a2 2 0 0 0 0 4H16"/></svg>',
    due:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M7 11h10M8 15h3"/></svg>',
    paid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.1 2.4 2.4 5.3-5.4"/></svg>',
    remaining:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10M7 20h10M8 4c0 4 8 4 8 8s-8 4-8 8"/></svg>'
  };

  function waitForModules(){
    if(!window.__bsOfisV179Loaded || !document.querySelector('#v178QuickActions')){
      setTimeout(waitForModules,100);
      return;
    }
    applyCurrentUi();
  }

  function ensureStyles(){
    if(document.querySelector('#bsCurrentUiStyles')) return;
    const style=document.createElement('style');
    style.id='bsCurrentUiStyles';
    style.textContent=`
      :root{
        --bs-navy:#1E3A8A;
        --bs-blue:#2563EB;
        --bs-blue-soft:#EFF6FF;
        --bs-teal:#148A86;
        --bs-teal-soft:#ECFDF9;
        --bs-orange:#F59E0B;
        --bs-orange-soft:#FFF7E8;
        --bs-red:#EF4444;
        --bs-red-soft:#FEF2F2;
        --bs-bg:#F8FAFC;
        --bs-card:#FFFFFF;
        --bs-line:#E2E8F0;
        --bs-line-strong:#CBD5E1;
        --bs-text:#0F172A;
        --bs-muted:#64748B;
        --bg:var(--bs-bg);
        --card:var(--bs-card);
        --line:var(--bs-line);
        --ink:var(--bs-text);
        --muted:var(--bs-muted);
        --accent:var(--bs-blue);
        --success:var(--bs-teal);
      }

      html,body{background:var(--bs-bg)!important;color:var(--bs-text)!important}
      body{letter-spacing:-.012em!important}
      .app-shell{max-width:860px!important;padding-bottom:92px!important}

      /* Tek ve sade marka barı */
      .topbar{
        min-height:58px!important;
        margin:0 0 14px!important;
        padding:calc(8px + env(safe-area-inset-top)) 14px 8px!important;
        background:#fff!important;
        color:var(--bs-text)!important;
        border-bottom:1px solid var(--bs-line)!important;
        box-shadow:0 1px 4px rgba(15,23,42,.035)!important;
      }
      .topbar > div:first-child{gap:10px!important;min-width:0!important}
      .topbar .bs-brand-mark{
        width:40px!important;height:40px!important;flex:0 0 40px!important;
        object-fit:contain!important;border-radius:11px!important;
        box-shadow:0 2px 7px rgba(37,99,235,.13)!important;
      }
      .topbar .bs-brand-copy{
        min-width:0!important;display:flex!important;flex-direction:column-reverse!important;
        justify-content:center!important;gap:2px!important;line-height:1!important;
      }
      .topbar #appTitle{
        margin:0!important;color:var(--bs-text)!important;font-size:15px!important;
        font-weight:850!important;letter-spacing:-.025em!important;white-space:nowrap!important;
      }
      .topbar #orgEyebrow{
        margin:0!important;color:var(--bs-blue)!important;font-size:7px!important;
        font-weight:850!important;letter-spacing:.18em!important;line-height:1!important;
      }
      .top-actions{gap:6px!important}
      .top-actions .status-badge{
        background:#F1F5F9!important;color:#475569!important;border:1px solid var(--bs-line)!important;
        box-shadow:none!important;backdrop-filter:none!important;font-weight:750!important;
      }
      .top-actions .status-badge.online{
        background:var(--bs-teal-soft)!important;color:var(--bs-teal)!important;border-color:#C9EEE8!important;
      }
      .top-actions .icon-btn{
        width:38px!important;height:38px!important;border-radius:11px!important;
        background:#fff!important;color:#475569!important;border:1px solid var(--bs-line)!important;
        box-shadow:none!important;
      }
      .top-actions .icon-btn svg{width:18px!important;height:18px!important;display:block!important}
      .top-actions .icon-btn:active{background:#F1F5F9!important}

      /* Ana özet */
      #dashboard .summary-grid{gap:10px!important;margin:0 0 15px!important}
      .summary-card{
        min-height:104px!important;padding:14px 14px 13px!important;
        background:#fff!important;border:1px solid var(--bs-line)!important;border-radius:16px!important;
        box-shadow:0 2px 8px rgba(15,23,42,.035)!important;align-content:start!important;
      }
      .summary-card::after{display:none!important}
      .bs-summary-head{display:flex!important;align-items:center!important;gap:8px!important;margin-bottom:8px!important}
      .bs-summary-icon{width:30px!important;height:30px!important;border-radius:10px!important;display:grid!important;place-items:center!important;flex:0 0 30px!important}
      .bs-summary-icon svg{width:17px!important;height:17px!important}
      .summary-card:nth-child(1) .bs-summary-icon{background:var(--bs-teal-soft)!important;color:var(--bs-teal)!important}
      .summary-card:nth-child(2) .bs-summary-icon{background:var(--bs-red-soft)!important;color:#DC4B4B!important}
      .summary-card:nth-child(3) .bs-summary-icon{background:var(--bs-blue-soft)!important;color:var(--bs-blue)!important}
      .summary-card:nth-child(4) .bs-summary-icon{background:var(--bs-orange-soft)!important;color:#D98400!important}
      .bs-summary-label{color:#475569!important;font-size:11px!important;font-weight:800!important;line-height:1.15!important}
      .summary-card > strong{font-size:23px!important;color:var(--bs-text)!important;font-weight:850!important;letter-spacing:-.025em!important}
      .summary-card.income > strong{color:var(--bs-teal)!important}
      .summary-card.paid > strong{color:var(--bs-blue)!important}
      .summary-card.remaining > strong{color:#D98400!important}
      .summary-card > small{color:#94A3B8!important;font-size:10px!important}

      /* Hızlı işlemler */
      #v178QuickActions{margin:0 0 16px!important}
      #v178QuickActions .v178-quick-head{margin:0 1px 8px!important}
      #v178QuickActions .v178-quick-head strong{font-size:13px!important;color:var(--bs-text)!important}
      #v178QuickActions .v178-quick-head small{color:#94A3B8!important}
      #v178QuickActions .v178-quick-grid{gap:8px!important}
      #v178QuickActions .v178-quick-btn{
        min-height:66px!important;background:#fff!important;border:1px solid var(--bs-line)!important;
        border-radius:14px!important;box-shadow:0 1px 5px rgba(15,23,42,.025)!important;
        color:var(--bs-text)!important;
      }
      #v178QuickActions .v178-quick-btn:hover{border-color:#D4DCE7!important;box-shadow:0 2px 7px rgba(15,23,42,.04)!important}
      #v178QuickActions .v178-quick-btn:active{background:#F8FAFC!important;transform:scale(.99)!important}
      #v178QuickActions .v178-quick-icon{width:34px!important;height:34px!important;border-radius:10px!important;box-shadow:none!important;border:0!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="income"] .v178-quick-icon{background:var(--bs-teal-soft)!important;color:var(--bs-teal)!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="payment"] .v178-quick-icon{background:var(--bs-blue-soft)!important;color:var(--bs-blue)!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="debt"] .v178-quick-icon{background:var(--bs-orange-soft)!important;color:#D98400!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="expense"] .v178-quick-icon{background:var(--bs-red-soft)!important;color:#DC4B4B!important}
      #v178QuickActions .v178-quick-label{color:#334155!important;font-size:10.5px!important;font-weight:800!important}

      /* Özet yönetim paneli */
      #v177DashboardPanel{gap:9px!important;margin-bottom:18px!important}
      .v177-balance-card,.v179-progress-card,.v177-flow-card,.v177-attention-card{
        background:#fff!important;border:1px solid var(--bs-line)!important;border-radius:15px!important;
        box-shadow:0 1px 6px rgba(15,23,42,.025)!important;
      }
      .v177-balance-card{border-left:3px solid var(--bs-teal)!important}
      .v177-balance-main span{color:var(--bs-teal)!important}
      .v177-balance-status{background:var(--bs-teal-soft)!important;color:var(--bs-teal)!important}
      .v179-progress-track{height:8px!important;background:#EEF2F7!important}
      .v179-progress-track span{background:linear-gradient(90deg,var(--bs-blue),#4F8CFF)!important}
      .v179-progress-head strong{color:var(--bs-teal)!important}
      .v177-flow-card:nth-child(1){border-top:2px solid var(--bs-teal)!important}
      .v177-flow-card:nth-child(2){border-top:2px solid var(--bs-blue)!important}
      .v177-flow-card:nth-child(3){border-top:2px solid var(--bs-red)!important}

      /* Başlık, filtre, kart */
      .page-title{margin:7px 2px 14px!important;align-items:center!important}
      .page-title .eyebrow{color:var(--bs-teal)!important;opacity:1!important;font-size:10px!important;letter-spacing:.13em!important;font-weight:850!important}
      .page-title h2{color:var(--bs-text)!important;font-size:25px!important;line-height:1.05!important;letter-spacing:-.035em!important}
      .primary,.page-title .primary{background:var(--bs-blue)!important;color:#fff!important;border-color:var(--bs-blue)!important;border-radius:12px!important;box-shadow:0 2px 6px rgba(37,99,235,.14)!important}
      .primary:active{transform:translateY(1px)!important;box-shadow:none!important}
      .secondary{background:#fff!important;color:#334155!important;border:1px solid var(--bs-line)!important;border-radius:11px!important}

      input,select,textarea{border-color:var(--bs-line-strong)!important;background:#fff!important;color:var(--bs-text)!important;border-radius:12px!important}
      .toolbar input,.toolbar select,.debt-toolbar input,.debt-toolbar select,.payment-filter-row select{min-height:44px!important}
      input:focus,select:focus,textarea:focus{outline:none!important;border-color:#93B4FF!important;box-shadow:0 0 0 3px rgba(37,99,235,.10)!important}

      .kpi,.v175-quick-card,.income-owner-kpi,.panel,.assistant-card,.list-card{
        background:#fff!important;border-color:var(--bs-line)!important;box-shadow:0 1px 5px rgba(15,23,42,.022)!important;
      }
      .kpi,.v175-quick-card,.income-owner-kpi{border-radius:14px!important}
      .income-owner-kpi.active,.v175-quick-card.active{background:var(--bs-teal-soft)!important;border-color:#A9DDD4!important}
      .income-owner-kpi.active span,.income-owner-kpi.active strong,.v175-quick-card.active span,.v175-quick-card.active strong,.v175-quick-card.active small{color:var(--bs-teal)!important}
      #incomes .kpi-grid > .kpi[data-income-main-filter].active{background:var(--bs-blue-soft)!important;border-color:#AAC4FF!important}
      #incomes .kpi-grid > .kpi[data-income-main-filter].active span,#incomes .kpi-grid > .kpi[data-income-main-filter].active strong,#incomes .kpi-grid > .kpi[data-income-main-filter].active small{color:var(--bs-blue)!important}

      .list{gap:9px!important}
      .list-card{border-radius:14px!important;padding-top:13px!important;padding-bottom:13px!important}
      .list-card strong{color:var(--bs-text)!important;font-weight:820!important}
      .list-card small{color:var(--bs-muted)!important}
      .list-card .amount{color:var(--bs-text)!important;font-weight:850!important}
      .list-card.clickable:active{background:#F8FAFC!important}
      .badge.red{background:var(--bs-red-soft)!important;color:#D64040!important}
      .badge.orange{background:var(--bs-orange-soft)!important;color:#C97800!important}
      .badge.green{background:#ECFDF3!important;color:#168A42!important}

      /* Alt menü */
      .bottom-nav{background:rgba(255,255,255,.985)!important;border-top:1px solid var(--bs-line)!important;box-shadow:0 -2px 10px rgba(15,23,42,.035)!important;padding-top:6px!important}
      .nav-btn{color:#64748B!important;background:transparent!important;box-shadow:none!important;border-radius:10px!important}
      .nav-btn span{min-width:34px!important;min-height:29px!important;border-radius:9px!important;display:grid!important;place-items:center!important;background:transparent!important}
      .nav-btn.active{color:var(--bs-blue)!important;background:transparent!important}
      .nav-btn.active span{color:var(--bs-blue)!important;background:var(--bs-blue-soft)!important}
      .nav-btn.active::before{display:none!important}
      .nav-btn small{font-weight:750!important}

      dialog{border-radius:20px!important;box-shadow:0 22px 55px rgba(15,23,42,.17)!important}
      .dialog-head h3{color:var(--bs-text)!important}
      .v179-detail-hero{background:#F8FAFC!important;border-color:var(--bs-line)!important}
      .v179-detail-pill{background:var(--bs-teal-soft)!important;color:var(--bs-teal)!important}

      @media(min-width:760px){
        #dashboard .summary-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
        #v178QuickActions .v178-quick-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
        #v178QuickActions .v178-quick-btn{min-height:70px!important}
      }
      @media(max-width:520px){
        .app-shell{padding-left:12px!important;padding-right:12px!important}
        .topbar{margin-left:-12px!important;margin-right:-12px!important;min-height:54px!important;padding:calc(7px + env(safe-area-inset-top)) 12px 7px!important}
        .topbar .bs-brand-mark{width:38px!important;height:38px!important;flex-basis:38px!important}
        .topbar #appTitle{font-size:14.5px!important}
        .top-actions .status-badge{display:none!important}
        .top-actions .icon-btn{width:36px!important;height:36px!important}
        .summary-card{min-height:100px!important;padding:13px 12px!important}
        .summary-card > strong{font-size:21px!important}
        #v178QuickActions .v178-quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #v178QuickActions .v178-quick-btn{min-height:58px!important;padding:9px 11px!important}
        .page-title h2{font-size:24px!important}
      }
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function applyBrand(){
    const left=document.querySelector('.topbar > div:first-child');
    if(!left) return;

    const img=left.querySelector('img');
    if(img){
      img.src='bs-budget-mark.svg?v=190';
      img.alt='BS Ofis Bütçe';
      img.className='bs-brand-mark';
      img.removeAttribute('style');
      img.width=40;
      img.height=40;
    }

    const legacyDuplicate=left.querySelector('.v182-brand-copy');
    if(legacyDuplicate) legacyDuplicate.remove();

    const copy=left.querySelector('div');
    if(copy){
      copy.classList.remove('v180-original-brand-copy','v182-brand-copy');
      copy.classList.add('bs-brand-copy');
      copy.removeAttribute('aria-hidden');
      copy.removeAttribute('style');
    }

    const eyebrow=document.querySelector('#orgEyebrow');
    if(eyebrow) eyebrow.textContent='YÖNETİMİ';

    const settings=document.querySelector('#settingsShortcut');
    if(settings){
      settings.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h-.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v-.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.36.37.7.6 1 .28.34.67.56 1.1.6h.1v4h-.1c-.43.04-.82.26-1.1.6-.23.3-.44.64-.6 1Z"/></svg>';
    }
    const install=document.querySelector('#installBtn');
    if(install){
      install.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>';
    }

    document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]').forEach(link=>{
      link.href='bs-budget-mark.svg?v=190';
    });
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content','#F8FAFC');
    document.title='BS OFİS BÜTÇE';
  }

  function upgradeSummaryCards(){
    const cards=[...document.querySelectorAll('#dashboard .summary-grid .summary-card')];
    const kinds=['income','due','paid','remaining'];
    cards.forEach((card,index)=>{
      if(card.querySelector('.bs-summary-head')) return;
      const oldHead=card.querySelector('.v180-summary-head');
      if(oldHead){
        oldHead.classList.remove('v180-summary-head');
        oldHead.classList.add('bs-summary-head');
        const oldIcon=oldHead.querySelector('.v180-summary-icon');
        const oldLabel=oldHead.querySelector('.v180-summary-label');
        if(oldIcon){oldIcon.classList.remove('v180-summary-icon');oldIcon.classList.add('bs-summary-icon');}
        if(oldLabel){oldLabel.classList.remove('v180-summary-label');oldLabel.classList.add('bs-summary-label');}
        return;
      }
      const label=card.querySelector(':scope > span');
      if(!label) return;
      const head=document.createElement('div');
      head.className='bs-summary-head';
      head.innerHTML=`<span class="bs-summary-icon" aria-hidden="true">${ICONS[kinds[index]] || ICONS.income}</span><span class="bs-summary-label">${label.textContent}</span>`;
      label.replaceWith(head);
    });
  }

  function reorderDashboard(){
    const summary=document.querySelector('#dashboard .summary-grid');
    const quick=document.querySelector('#v178QuickActions');
    const panel=document.querySelector('#v177DashboardPanel');
    if(!summary || !quick || !panel) return;
    summary.insertAdjacentElement('afterend',quick);
    quick.insertAdjacentElement('afterend',panel);
  }

  function keepBrandCopyStable(){
    const eyebrow=document.querySelector('#orgEyebrow');
    if(eyebrow && eyebrow.textContent!=='YÖNETİMİ') eyebrow.textContent='YÖNETİMİ';
  }

  function applyCurrentUi(){
    ensureStyles();
    applyBrand();
    upgradeSummaryCards();
    reorderDashboard();

    if(typeof renderTitles==='function' && !renderTitles.__bsUiWrapped){
      const originalRenderTitles=renderTitles;
      const wrapped=function(){
        originalRenderTitles();
        keepBrandCopyStable();
      };
      wrapped.__bsUiWrapped=true;
      renderTitles=wrapped;
    }

    if(typeof renderDashboard==='function' && !renderDashboard.__bsUiWrapped){
      const originalRenderDashboard=renderDashboard;
      const wrapped=function(){
        originalRenderDashboard();
        upgradeSummaryCards();
        reorderDashboard();
      };
      wrapped.__bsUiWrapped=true;
      renderDashboard=wrapped;
    }

    keepBrandCopyStable();
  }

  waitForModules();
})();