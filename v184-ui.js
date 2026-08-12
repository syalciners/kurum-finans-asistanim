/* BS OFİS BÜTÇE V1.8.4 - Kullanıcı dostu mavi/gümüş arayüz */
(() => {
  if(window.__bsBudgetV184Booted) return;
  window.__bsBudgetV184Booted = true;

  function waitAndApply(){
    if(!window.__bsBudgetV182Applied || !document.querySelector('#v182ThemeStyles')){
      setTimeout(waitAndApply,120);
      return;
    }
    applyV184();
  }

  function ensureStyles(){
    if(document.querySelector('#v184ThemeStyles')) return;
    const style=document.createElement('style');
    style.id='v184ThemeStyles';
    style.textContent=`
      :root{
        --bs-navy:#1E3A8A;
        --bs-blue:#2563EB;
        --bs-blue-soft:#EFF6FF;
        --bs-teal:#148A86;
        --bs-teal-soft:#ECFDF9;
        --bs-green:#22C55E;
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

      /* Üst bar: açık, kısa, teknik DOM'a dokunmaz. */
      .topbar{
        min-height:58px!important;
        margin-bottom:14px!important;
        padding:calc(8px + env(safe-area-inset-top)) 14px 8px!important;
        background:rgba(255,255,255,.98)!important;
        color:var(--bs-text)!important;
        border-bottom:1px solid var(--bs-line)!important;
        box-shadow:0 1px 4px rgba(15,23,42,.035)!important;
      }
      .topbar > div:first-child{gap:10px!important}
      .v180-brand-logo.v182-brand-mark{
        width:40px!important;height:40px!important;flex:0 0 40px!important;
        border-radius:11px!important;box-shadow:0 2px 7px rgba(37,99,235,.14)!important;
      }
      .v182-brand-copy{gap:2px!important}
      .v182-brand-copy strong{
        color:var(--bs-text)!important;font-size:15px!important;font-weight:850!important;
        letter-spacing:-.025em!important;
      }
      .v182-brand-copy small{
        color:var(--bs-blue)!important;font-size:7px!important;font-weight:850!important;
        letter-spacing:.18em!important;
      }
      .top-actions{gap:6px!important}
      .top-actions .status-badge{
        background:#F1F5F9!important;color:#475569!important;border:1px solid var(--bs-line)!important;
        box-shadow:none!important;font-weight:750!important;
      }
      .top-actions .status-badge.online{background:var(--bs-teal-soft)!important;color:var(--bs-teal)!important;border-color:#C9EEE8!important}
      .top-actions .icon-btn{
        width:38px!important;height:38px!important;border-radius:11px!important;
        background:#fff!important;color:#475569!important;border:1px solid var(--bs-line)!important;
        box-shadow:none!important;
      }
      .top-actions .icon-btn:active{background:#F1F5F9!important}

      /* Ana özet kartları */
      #dashboard .summary-grid{gap:10px!important;margin:0 0 15px!important}
      .summary-card{
        min-height:104px!important;padding:14px 14px 13px!important;
        background:#fff!important;border:1px solid var(--bs-line)!important;border-radius:16px!important;
        box-shadow:0 2px 8px rgba(15,23,42,.035)!important;
      }
      .summary-card::after{display:none!important}
      .v180-summary-head{gap:8px!important;margin-bottom:8px!important}
      .v180-summary-icon{width:30px!important;height:30px!important;border-radius:10px!important}
      .v180-summary-icon svg{width:17px!important;height:17px!important}
      .summary-card:nth-child(1) .v180-summary-icon{background:var(--bs-teal-soft)!important;color:var(--bs-teal)!important}
      .summary-card:nth-child(2) .v180-summary-icon{background:var(--bs-red-soft)!important;color:#DC4B4B!important}
      .summary-card:nth-child(3) .v180-summary-icon{background:var(--bs-blue-soft)!important;color:var(--bs-blue)!important}
      .summary-card:nth-child(4) .v180-summary-icon{background:var(--bs-orange-soft)!important;color:#D98400!important}
      .summary-card .v180-summary-label{color:#475569!important;font-size:11px!important;font-weight:800!important}
      .summary-card > strong{font-size:23px!important;color:var(--bs-text)!important;font-weight:850!important;letter-spacing:-.025em!important}
      .summary-card.income > strong{color:var(--bs-teal)!important}
      .summary-card.paid > strong{color:var(--bs-blue)!important}
      .summary-card.remaining > strong{color:#D98400!important}
      .summary-card > small{color:#94A3B8!important;font-size:10px!important}

      /* Hızlı işlemler: beyaz zemin + anlamlı ikon rengi */
      #v178QuickActions{margin-bottom:16px!important}
      #v178QuickActions .v178-quick-head{margin:0 1px 8px!important}
      #v178QuickActions .v178-quick-head strong{font-size:13px!important;color:var(--bs-text)!important}
      #v178QuickActions .v178-quick-head small{color:#94A3B8!important}
      #v178QuickActions .v178-quick-grid{gap:8px!important}
      #v178QuickActions .v178-quick-btn{
        min-height:66px!important;background:#fff!important;border:1px solid var(--bs-line)!important;
        border-radius:14px!important;box-shadow:0 1px 5px rgba(15,23,42,.025)!important;
        color:var(--bs-text)!important;
      }
      #v178QuickActions .v178-quick-btn:active{background:#F8FAFC!important;transform:scale(.99)!important}
      #v178QuickActions .v178-quick-icon{width:34px!important;height:34px!important;border-radius:10px!important;box-shadow:none!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="income"] .v178-quick-icon{background:var(--bs-teal-soft)!important;color:var(--bs-teal)!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="payment"] .v178-quick-icon{background:var(--bs-blue-soft)!important;color:var(--bs-blue)!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="debt"] .v178-quick-icon{background:var(--bs-orange-soft)!important;color:#D98400!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="expense"] .v178-quick-icon{background:var(--bs-red-soft)!important;color:#DC4B4B!important}
      #v178QuickActions .v178-quick-label{color:#334155!important;font-size:10.5px!important;font-weight:800!important}

      /* Yönetim paneli */
      #v177DashboardPanel{gap:9px!important;margin-bottom:18px!important}
      .v177-balance-card,.v179-progress-card,.v177-flow-card,.v177-attention-card{
        background:#fff!important;border:1px solid var(--bs-line)!important;border-radius:15px!important;
        box-shadow:0 1px 6px rgba(15,23,42,.025)!important;
      }
      .v177-balance-card{border-left:3px solid var(--bs-teal)!important}
      .v177-balance-main span,.v179-progress-head strong{color:var(--bs-teal)!important}
      .v177-balance-status{background:var(--bs-teal-soft)!important;color:var(--bs-teal)!important}
      .v179-progress-track{height:8px!important;background:#EEF2F7!important}
      .v179-progress-track span{background:linear-gradient(90deg,var(--bs-blue),#4F8CFF)!important}
      .v177-flow-card:nth-child(1){border-top:2px solid var(--bs-teal)!important}
      .v177-flow-card:nth-child(2){border-top:2px solid var(--bs-blue)!important}
      .v177-flow-card:nth-child(3){border-top:2px solid var(--bs-red)!important}

      /* Sayfa başlıkları ve eylemler */
      .page-title{margin:7px 2px 14px!important;align-items:center!important}
      .page-title .eyebrow{color:var(--bs-teal)!important;opacity:1!important;font-size:10px!important;letter-spacing:.13em!important;font-weight:850!important}
      .page-title h2{color:var(--bs-text)!important;font-size:25px!important;line-height:1.05!important;letter-spacing:-.035em!important}
      .primary,.page-title .primary{
        background:var(--bs-blue)!important;color:#fff!important;border-color:var(--bs-blue)!important;
        border-radius:12px!important;box-shadow:0 2px 6px rgba(37,99,235,.14)!important;
      }
      .primary:active{transform:translateY(1px)!important;box-shadow:none!important}
      .secondary{background:#fff!important;color:#334155!important;border:1px solid var(--bs-line)!important;border-radius:11px!important}

      /* Filtreler */
      input,select,textarea{
        border-color:var(--bs-line-strong)!important;background:#fff!important;color:var(--bs-text)!important;
        border-radius:12px!important;
      }
      .toolbar input,.toolbar select,.debt-toolbar input,.debt-toolbar select,.payment-filter-row select{
        min-height:44px!important;
      }
      input:focus,select:focus,textarea:focus{
        outline:none!important;border-color:#93B4FF!important;box-shadow:0 0 0 3px rgba(37,99,235,.10)!important;
      }

      /* KPI ve hızlı filtre kartları */
      .kpi,.v175-quick-card,.income-owner-kpi,.panel,.assistant-card,.list-card{
        background:#fff!important;border-color:var(--bs-line)!important;
        box-shadow:0 1px 5px rgba(15,23,42,.022)!important;
      }
      .kpi,.v175-quick-card,.income-owner-kpi{border-radius:14px!important}
      .income-owner-kpi.active,.v175-quick-card.active{
        background:var(--bs-teal-soft)!important;border-color:#A9DDD4!important;
      }
      .income-owner-kpi.active span,.income-owner-kpi.active strong,.v175-quick-card.active span,.v175-quick-card.active strong,.v175-quick-card.active small{color:var(--bs-teal)!important}
      #incomes .kpi-grid > .kpi[data-income-main-filter].active{
        background:var(--bs-blue-soft)!important;border-color:#AAC4FF!important;
      }
      #incomes .kpi-grid > .kpi[data-income-main-filter].active span,
      #incomes .kpi-grid > .kpi[data-income-main-filter].active strong,
      #incomes .kpi-grid > .kpi[data-income-main-filter].active small{color:var(--bs-blue)!important}

      /* Liste kartları */
      .list{gap:9px!important}
      .list-card{
        border-radius:14px!important;padding-top:13px!important;padding-bottom:13px!important;
      }
      .list-card strong{color:var(--bs-text)!important;font-weight:820!important}
      .list-card small{color:var(--bs-muted)!important}
      .list-card .amount{color:var(--bs-text)!important;font-weight:850!important}
      .list-card.clickable:active{background:#F8FAFC!important}
      .badge.red{background:var(--bs-red-soft)!important;color:#D64040!important}
      .badge.orange{background:var(--bs-orange-soft)!important;color:#C97800!important}
      .badge.green{background:#ECFDF3!important;color:#168A42!important}

      /* Alt menü: açık, sade, aktif ikon mavi */
      .bottom-nav{
        background:rgba(255,255,255,.985)!important;border-top:1px solid var(--bs-line)!important;
        box-shadow:0 -2px 10px rgba(15,23,42,.035)!important;padding-top:6px!important;
      }
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
        .v180-brand-logo.v182-brand-mark{width:38px!important;height:38px!important;flex-basis:38px!important}
        .v182-brand-copy strong{font-size:14.5px!important}
        .top-actions .status-badge{display:none!important}
        .top-actions .icon-btn{width:36px!important;height:36px!important}
        .summary-card{min-height:100px!important;padding:13px 12px!important}
        .summary-card > strong{font-size:21px!important}
        #v178QuickActions .v178-quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #v178QuickActions .v178-quick-btn{min-height:58px!important;padding:9px 11px!important}
        .page-title h2{font-size:24px!important}
      }

      @media(prefers-reduced-motion:reduce){
        *,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function applyBrandSafely(){
    const logo=document.querySelector('.v180-brand-logo.v182-brand-mark');
    if(logo){
      logo.src='bs-budget-mark.svg?v=184';
      logo.alt='BS Ofis Bütçe Yönetimi';
    }

    const copy=document.querySelector('.v182-brand-copy');
    if(copy){
      const strong=copy.querySelector('strong');
      const small=copy.querySelector('small');
      if(strong) strong.textContent='BS Ofis Bütçe';
      if(small) small.textContent='Yönetimi';
    }

    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content','#F8FAFC');
    document.title='BS OFİS BÜTÇE YÖNETİMİ';
  }

  function applyV184(){
    if(window.__bsBudgetV184Applied) return;
    window.__bsBudgetV184Applied=true;
    ensureStyles();
    applyBrandSafely();
  }

  waitAndApply();
})();