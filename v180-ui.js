/* BS BÜTÇE YÖNETİMİ V1.8.0 - Kurumsal tema */
(() => {
  if(window.__bsBudgetV180Booted) return;
  window.__bsBudgetV180Booted = true;

  const COLORS = {
    navy:'#14213D',
    navyDeep:'#07162E',
    teal:'#087F73',
    turquoise:'#10BFA3',
    blue:'#246BFD',
    gold:'#D7A52A',
    orange:'#F59E0B',
    red:'#EF4444'
  };

  function waitForPreviousLayers(){
    if(!window.__bsOfisV179Loaded || !document.querySelector('#v178QuickActions')){
      setTimeout(waitForPreviousLayers,120);
      return;
    }
    applyTheme();
  }

  function iconSvg(kind){
    const icons = {
      income:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M8.5 10h5a2 2 0 0 1 0 4h-3a2 2 0 0 0 0 4H16"/></svg>',
      due:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M7 11h10M8 15h3"/></svg>',
      paid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 9"/></svg>',
      remaining:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10M7 20h10M8 4c0 4 8 4 8 8s-8 4-8 8"/></svg>'
    };
    return icons[kind] || icons.income;
  }

  function ensureStyles(){
    if(document.querySelector('#v180ThemeStyles')) return;
    const style = document.createElement('style');
    style.id = 'v180ThemeStyles';
    style.textContent = `
      :root{
        --brand-navy:${COLORS.navy};
        --brand-navy-deep:${COLORS.navyDeep};
        --brand-teal:${COLORS.teal};
        --brand-turquoise:${COLORS.turquoise};
        --brand-blue:${COLORS.blue};
        --brand-gold:${COLORS.gold};
        --bg:#f3f6fb;
        --ink:${COLORS.navy};
        --accent:${COLORS.blue};
        --success:${COLORS.teal};
      }
      html,body{background:#f3f6fb}
      body{letter-spacing:-.01em}
      .app-shell{max-width:760px;padding-bottom:100px}

      .topbar{
        margin:0 -16px 18px;
        padding:calc(12px + env(safe-area-inset-top)) 16px 13px;
        min-height:76px;
        background:linear-gradient(135deg,#0b1d3a 0%,${COLORS.navy} 58%,#0c3452 100%);
        border-bottom:1px solid rgba(16,191,163,.22);
        box-shadow:0 12px 30px rgba(7,22,46,.16);
        color:#fff;
      }
      .topbar > div:first-child{gap:9px!important;min-width:0}
      .v180-brand-logo{width:154px;height:46px;object-fit:contain;object-position:left center;display:block}
      .v180-original-brand-copy{display:none!important}
      .top-actions{gap:7px}
      .top-actions .status-badge{
        background:rgba(255,255,255,.1);
        border:1px solid rgba(255,255,255,.12);
        color:#dce9ff;
        backdrop-filter:blur(8px);
      }
      .top-actions .status-badge.online{background:rgba(16,191,163,.15);color:#bffcef}
      .top-actions .icon-btn{
        background:rgba(255,255,255,.09);
        color:#fff;
        border:1px solid rgba(255,255,255,.1);
      }
      .top-actions .icon-btn:active{background:rgba(255,255,255,.18)}

      .summary-grid{gap:10px;margin:2px 0 14px}
      .summary-card{
        min-height:110px;
        position:relative;
        overflow:hidden;
        padding:15px 14px 14px;
        border:1px solid #e1e7f0;
        border-radius:17px;
        background:#fff;
        box-shadow:0 8px 24px rgba(20,33,61,.055);
        align-content:start;
      }
      .summary-card::after{
        content:"";
        position:absolute;
        inset:0 0 auto 0;
        height:3px;
        background:#dce5f3;
      }
      .summary-card:nth-child(1)::after{background:${COLORS.turquoise}}
      .summary-card:nth-child(2)::after{background:${COLORS.red}}
      .summary-card:nth-child(3)::after{background:${COLORS.blue}}
      .summary-card:nth-child(4)::after{background:${COLORS.orange}}
      .v180-summary-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}
      .v180-summary-icon{
        width:28px;height:28px;display:grid;place-items:center;border-radius:9px;flex:0 0 28px;
      }
      .v180-summary-icon svg{width:16px;height:16px}
      .summary-card:nth-child(1) .v180-summary-icon{background:#e7f8f4;color:${COLORS.teal}}
      .summary-card:nth-child(2) .v180-summary-icon{background:#fff0f0;color:${COLORS.red}}
      .summary-card:nth-child(3) .v180-summary-icon{background:#edf3ff;color:${COLORS.blue}}
      .summary-card:nth-child(4) .v180-summary-icon{background:#fff5df;color:#d98600}
      .summary-card .v180-summary-label{font-size:11px;font-weight:800;color:#536078;line-height:1.15}
      .summary-card > strong{font-size:24px;line-height:1.08;color:${COLORS.navy};margin:1px 0 3px}
      .summary-card.income > strong{color:${COLORS.teal}}
      .summary-card.paid > strong{color:${COLORS.blue}}
      .summary-card.remaining > strong{color:#d98600}
      .summary-card > small{font-size:10px;color:#8790a3}

      #v178QuickActions{margin:0 0 18px}
      #v178QuickActions .v178-quick-head{margin-bottom:9px}
      #v178QuickActions .v178-quick-head strong{font-size:14px;color:${COLORS.navy}}
      #v178QuickActions .v178-quick-head small{font-size:10px}
      #v178QuickActions .v178-quick-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
      #v178QuickActions .v178-quick-btn{
        min-height:82px;
        border:0;
        color:#fff;
        border-radius:15px;
        box-shadow:0 8px 18px rgba(20,33,61,.12);
        grid-template-columns:1fr;
        justify-items:center;
        align-content:center;
        padding:10px 7px;
      }
      #v178QuickActions .v178-quick-btn[data-v178-action="income"]{background:linear-gradient(145deg,#0aa982,${COLORS.teal})}
      #v178QuickActions .v178-quick-btn[data-v178-action="payment"]{background:linear-gradient(145deg,#3d7bff,${COLORS.blue})}
      #v178QuickActions .v178-quick-btn[data-v178-action="debt"]{background:linear-gradient(145deg,#ffa124,#f47713)}
      #v178QuickActions .v178-quick-btn[data-v178-action="expense"]{background:linear-gradient(145deg,#fa5b62,#e73542)}
      #v178QuickActions .v178-quick-icon{
        width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.94)!important;
      }
      #v178QuickActions .v178-quick-btn[data-v178-action="income"] .v178-quick-icon{color:${COLORS.teal}!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="payment"] .v178-quick-icon{color:${COLORS.blue}!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="debt"] .v178-quick-icon{color:#e57a00!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="expense"] .v178-quick-icon{color:${COLORS.red}!important}
      #v178QuickActions .v178-quick-label{font-size:10px;color:#fff;font-weight:850;text-align:center}

      #v177DashboardPanel{gap:10px;margin-bottom:20px}
      .v177-balance-card{
        border:1px solid #dce7e4;
        background:linear-gradient(135deg,#fff 0%,#f5fbf9 100%);
        box-shadow:0 8px 22px rgba(20,33,61,.045);
      }
      .v177-balance-main span{color:${COLORS.teal}}
      .v177-balance-status{background:#e4f7f1;color:${COLORS.teal}}
      .v177-flow-card{border-color:#e3e8f1;box-shadow:0 5px 16px rgba(20,33,61,.035)}
      .v177-flow-card:nth-child(1){border-top:3px solid ${COLORS.turquoise}}
      .v177-flow-card:nth-child(2){border-top:3px solid ${COLORS.blue}}
      .v177-flow-card:nth-child(3){border-top:3px solid ${COLORS.red}}
      .v179-progress-card{border-color:#dde6f5;background:#fff}
      .v179-progress-track span{background:linear-gradient(90deg,${COLORS.teal},${COLORS.blue})}
      .v179-progress-head strong{color:${COLORS.teal}}

      .page-title{margin:9px 2px 14px}
      .page-title .eyebrow{color:${COLORS.teal}}
      .page-title h2{color:${COLORS.navy};font-size:26px;letter-spacing:-.03em}
      .section-head h2{font-size:17px;color:${COLORS.navy}}
      .primary{background:${COLORS.blue};box-shadow:0 5px 14px rgba(36,107,253,.18)}
      .secondary{background:#edf3ff;color:#2454a8}

      .kpi,.v175-quick-card,.income-owner-kpi,.panel,.assistant-card,.list-card{
        border-color:#e1e7f0;
        box-shadow:0 5px 18px rgba(20,33,61,.04);
      }
      .list-card{border-radius:14px}
      .income-owner-kpi.active,.v175-quick-card.active{background:#edf8f5;border-color:#9bd8ca}
      .income-owner-kpi.active span,.income-owner-kpi.active strong,.v175-quick-card.active span,.v175-quick-card.active strong,.v175-quick-card.active small{color:${COLORS.teal}}
      #incomes .kpi-grid > .kpi[data-income-main-filter].active{background:#edf3ff;border-color:#9db9f6}

      .bottom-nav{
        gap:3px;
        background:rgba(255,255,255,.98);
        border-top:1px solid #dfe5ef;
        box-shadow:0 -12px 34px rgba(20,33,61,.08);
        padding-top:7px;
      }
      .nav-btn{
        min-width:0;
        color:#667188;
        border-radius:11px;
        padding:5px 3px 4px;
      }
      .nav-btn span{min-width:34px;min-height:27px;background:transparent!important}
      .nav-btn.active{
        color:#fff;
        background:${COLORS.blue};
        box-shadow:0 5px 14px rgba(36,107,253,.22);
      }
      .nav-btn.active span{color:#fff}
      .nav-btn small{font-weight:750}

      dialog{border-radius:22px}
      .dialog-head h3{color:${COLORS.navy}}
      .v179-detail-hero{background:linear-gradient(135deg,#f8fbff,#f5faf9)}
      .v179-detail-pill{background:#e8f5f1;color:${COLORS.teal}}

      @media(max-width:520px){
        .app-shell{padding-left:12px;padding-right:12px}
        .topbar{margin-left:-12px;margin-right:-12px;padding-left:12px;padding-right:12px}
        .v180-brand-logo{width:136px;height:43px}
        .top-actions .status-badge{display:none}
        .summary-card{min-height:105px;padding:13px 12px}
        .summary-card > strong{font-size:21px}
        #v178QuickActions .v178-quick-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        #v178QuickActions .v178-quick-btn{
          min-height:62px;
          grid-template-columns:35px minmax(0,1fr);
          justify-items:start;
          align-items:center;
          padding:9px 12px;
        }
        #v178QuickActions .v178-quick-label{text-align:left;font-size:11px}
        .v177-flow-grid{gap:7px}
        .v177-flow-card strong{font-size:13px}
      }
      @media(max-width:360px){
        .v180-brand-logo{width:123px}
        .summary-card{padding:12px 10px}
        .summary-card > strong{font-size:19px}
      }
    `;
    document.head.appendChild(style);
  }

  function applyBrandHeader(){
    const headerLeft = document.querySelector('.topbar > div:first-child');
    if(!headerLeft || headerLeft.dataset.v180Brand === '1') return;
    headerLeft.dataset.v180Brand = '1';

    const oldImg = headerLeft.querySelector('img');
    const copy = headerLeft.querySelector('div');
    if(copy) copy.classList.add('v180-original-brand-copy');

    const logo = document.createElement('img');
    logo.className = 'v180-brand-logo';
    logo.src = 'bs-budget-logo.svg?v=180';
    logo.alt = 'BS Bütçe Yönetimi';
    logo.width = 154;
    logo.height = 46;

    if(oldImg) oldImg.replaceWith(logo);
    else headerLeft.prepend(logo);
  }

  function upgradeSummaryCards(){
    const cards = [...document.querySelectorAll('#dashboard .summary-grid .summary-card')];
    const kinds = ['income','due','paid','remaining'];
    cards.forEach((card,index) => {
      if(card.dataset.v180Summary === '1') return;
      card.dataset.v180Summary = '1';
      const label = card.querySelector(':scope > span');
      if(!label) return;
      const head = document.createElement('div');
      head.className = 'v180-summary-head';
      head.innerHTML = `<span class="v180-summary-icon" aria-hidden="true">${iconSvg(kinds[index])}</span><span class="v180-summary-label">${label.textContent}</span>`;
      label.replaceWith(head);
    });
  }

  function reorderDashboard(){
    const summary = document.querySelector('#dashboard .summary-grid');
    const quick = document.querySelector('#v178QuickActions');
    const panel = document.querySelector('#v177DashboardPanel');
    if(!summary || !quick || !panel) return;
    summary.insertAdjacentElement('afterend',quick);
    quick.insertAdjacentElement('afterend',panel);
  }

  function applyDocumentBrand(){
    document.documentElement.style.setProperty('--theme-color',COLORS.navy);
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content',COLORS.navy);
    document.title = 'BS BÜTÇE YÖNETİMİ';
  }

  function applyTheme(){
    if(window.__bsBudgetV180Applied) return;
    window.__bsBudgetV180Applied = true;
    ensureStyles();
    applyBrandHeader();
    upgradeSummaryCards();
    reorderDashboard();
    applyDocumentBrand();

    const originalRenderDashboardV180 = renderDashboard;
    renderDashboard = function(){
      originalRenderDashboardV180();
      upgradeSummaryCards();
      reorderDashboard();
    };
  }

  waitForPreviousLayers();
})();