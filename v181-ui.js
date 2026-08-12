/* BS BÜTÇE YÖNETİMİ V1.8.1 - Sade kurumsal tema */
(() => {
  if(window.__bsBudgetV181Booted) return;
  window.__bsBudgetV181Booted = true;

  function applyV181(){
    if(!window.__bsBudgetV180Applied || !document.querySelector('#v178QuickActions')){
      setTimeout(applyV181,120);
      return;
    }
    if(document.querySelector('#v181ThemeStyles')) return;

    const style=document.createElement('style');
    style.id='v181ThemeStyles';
    style.textContent=`
      :root{
        --bg:#f6f8fb;
        --line:#e4e9f1;
      }
      html,body{background:#f6f8fb}

      .topbar{
        min-height:62px!important;
        margin-bottom:12px!important;
        padding:calc(8px + env(safe-area-inset-top)) 14px 8px!important;
        background:linear-gradient(135deg,#101f39 0%,#14213D 72%,#17344b 100%)!important;
        border-bottom:1px solid rgba(16,191,163,.12)!important;
        box-shadow:0 5px 16px rgba(7,22,46,.10)!important;
      }
      .v180-brand-logo{
        width:142px!important;
        height:40px!important;
      }
      .top-actions .icon-btn{
        width:40px!important;
        height:40px!important;
        background:rgba(255,255,255,.07)!important;
        border-color:rgba(255,255,255,.09)!important;
        box-shadow:none!important;
      }

      .summary-grid{gap:9px!important;margin-bottom:13px!important}
      .summary-card{
        min-height:100px!important;
        padding:13px 13px 12px!important;
        border-color:#e5e9f0!important;
        border-radius:16px!important;
        box-shadow:0 2px 10px rgba(20,33,61,.035)!important;
      }
      .summary-card::after{height:2px!important;opacity:.82}
      .v180-summary-icon{
        width:27px!important;
        height:27px!important;
        border-radius:9px!important;
      }
      .summary-card > strong{font-size:22px!important}
      .summary-card > small{color:#8c94a4!important}

      #v178QuickActions{margin-bottom:16px!important}
      #v178QuickActions .v178-quick-head{margin-bottom:8px!important}
      #v178QuickActions .v178-quick-head strong{font-size:13px!important}
      #v178QuickActions .v178-quick-grid{gap:8px!important}
      #v178QuickActions .v178-quick-btn{
        min-height:70px!important;
        border:1px solid transparent!important;
        border-radius:14px!important;
        box-shadow:0 2px 9px rgba(20,33,61,.035)!important;
      }
      #v178QuickActions .v178-quick-btn[data-v178-action="income"]{
        background:#edf9f6!important;
        border-color:#d4eee7!important;
        color:#087F73!important;
      }
      #v178QuickActions .v178-quick-btn[data-v178-action="payment"]{
        background:#f0f5ff!important;
        border-color:#dce7ff!important;
        color:#246BFD!important;
      }
      #v178QuickActions .v178-quick-btn[data-v178-action="debt"]{
        background:#fff7e8!important;
        border-color:#f8e8c7!important;
        color:#c97800!important;
      }
      #v178QuickActions .v178-quick-btn[data-v178-action="expense"]{
        background:#fff1f2!important;
        border-color:#f6dfe2!important;
        color:#d94750!important;
      }
      #v178QuickActions .v178-quick-icon{
        width:33px!important;
        height:33px!important;
        background:#fff!important;
        box-shadow:0 1px 5px rgba(20,33,61,.05)!important;
      }
      #v178QuickActions .v178-quick-label{
        color:currentColor!important;
        font-weight:800!important;
      }
      #v178QuickActions .v178-quick-btn:active{
        transform:scale(.99)!important;
      }

      #v177DashboardPanel{gap:9px!important;margin-bottom:18px!important}
      .v177-balance-card,
      .v179-progress-card,
      .v177-flow-card,
      .v177-attention-card{
        box-shadow:0 2px 10px rgba(20,33,61,.03)!important;
      }
      .v177-balance-card{
        background:#fff!important;
        border-color:#dfe9e6!important;
      }
      .v177-flow-card{
        border-top-width:2px!important;
      }
      .v179-progress-track{background:#edf1f6!important}

      .page-title{margin-top:6px!important}
      .page-title h2{font-size:25px!important}
      .page-title .eyebrow{letter-spacing:.11em!important;opacity:.88}
      .primary{
        box-shadow:none!important;
      }

      .kpi,.v175-quick-card,.income-owner-kpi,.panel,.assistant-card,.list-card{
        border-color:#e4e9f1!important;
        box-shadow:0 2px 9px rgba(20,33,61,.026)!important;
      }
      .list-card{border-radius:14px!important}
      .income-owner-kpi.active,.v175-quick-card.active{
        background:#f1f9f7!important;
        border-color:#b9dfd6!important;
      }
      #incomes .kpi-grid > .kpi[data-income-main-filter].active{
        background:#f3f6ff!important;
        border-color:#b9ccf7!important;
      }

      .bottom-nav{
        background:rgba(255,255,255,.98)!important;
        border-top:1px solid #e5e9f0!important;
        box-shadow:0 -5px 18px rgba(20,33,61,.045)!important;
        padding-top:6px!important;
      }
      .nav-btn{
        position:relative;
        color:#6e7789!important;
        background:transparent!important;
        box-shadow:none!important;
        border-radius:11px!important;
      }
      .nav-btn.active{
        color:#246BFD!important;
        background:#eef4ff!important;
        box-shadow:none!important;
      }
      .nav-btn.active span{color:#246BFD!important}
      .nav-btn.active::before{
        content:"";
        position:absolute;
        left:28%;
        right:28%;
        top:0;
        height:2px;
        border-radius:999px;
        background:#246BFD;
      }

      dialog{box-shadow:0 18px 50px rgba(20,33,61,.14)!important}
      .v179-detail-hero{background:#f9fbfd!important}

      @media(max-width:520px){
        .topbar{
          min-height:58px!important;
          padding:calc(7px + env(safe-area-inset-top)) 12px 7px!important;
        }
        .v180-brand-logo{width:128px!important;height:37px!important}
        .summary-card{min-height:96px!important;padding:12px 11px!important}
        .summary-card > strong{font-size:20px!important}
        #v178QuickActions .v178-quick-btn{
          min-height:58px!important;
          padding:8px 11px!important;
        }
        #v178QuickActions .v178-quick-label{font-size:11px!important}
      }
    `;
    document.head.appendChild(style);
  }

  applyV181();

  // V1.8.2 kullanıcı dostu sade tema katmanını yükle.
  if(!document.querySelector('script[data-v182-loader]')){
    const script=document.createElement('script');
    script.src='v182-ui.js?v=182';
    script.dataset.v182Loader='1';
    document.head.appendChild(script);
  }
})();