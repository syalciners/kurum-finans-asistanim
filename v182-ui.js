/* BS BÜTÇE YÖNETİMİ V1.8.2 - Kullanıcı dostu sade tema */
(() => {
  if(window.__bsBudgetV182Booted) return;
  window.__bsBudgetV182Booted = true;

  function waitAndApply(){
    if(!document.querySelector('#v181ThemeStyles') || !window.__bsBudgetV180Applied){
      setTimeout(waitAndApply,120);
      return;
    }
    applyV182();
  }

  function ensureStyles(){
    if(document.querySelector('#v182ThemeStyles')) return;
    const style=document.createElement('style');
    style.id='v182ThemeStyles';
    style.textContent=`
      :root{
        --bg:#f7f8fb;
        --line:#e6eaf0;
        --ink:#14213D;
        --accent:#246BFD;
        --success:#087F73;
      }
      html,body{background:#f7f8fb!important}

      .topbar{
        min-height:56px!important;
        margin-bottom:12px!important;
        padding:calc(7px + env(safe-area-inset-top)) 14px 7px!important;
        background:rgba(255,255,255,.98)!important;
        color:#14213D!important;
        border-bottom:1px solid #e7ebf1!important;
        box-shadow:0 2px 10px rgba(20,33,61,.035)!important;
      }
      .topbar > div:first-child{gap:9px!important}
      .v180-brand-logo.v182-brand-mark{
        width:38px!important;
        height:38px!important;
        object-fit:contain!important;
        border-radius:10px;
        flex:0 0 38px;
      }
      .v182-brand-copy{
        min-width:0;
        display:grid;
        gap:1px;
        line-height:1;
      }
      .v182-brand-copy strong{
        color:#14213D;
        font-size:16px;
        font-weight:850;
        letter-spacing:-.02em;
        white-space:nowrap;
      }
      .v182-brand-copy small{
        color:#087F73;
        font-size:8px;
        font-weight:850;
        letter-spacing:.18em;
        text-transform:uppercase;
      }
      .top-actions{gap:6px!important}
      .top-actions .status-badge{
        background:#f2f7f6!important;
        color:#087F73!important;
        border:1px solid #dcebe7!important;
        box-shadow:none!important;
        backdrop-filter:none!important;
      }
      .top-actions .icon-btn{
        width:38px!important;
        height:38px!important;
        background:#f7f8fb!important;
        color:#536078!important;
        border:1px solid #e4e8ef!important;
        box-shadow:none!important;
        border-radius:12px!important;
      }
      .top-actions .icon-btn svg{width:18px;height:18px;display:block}
      .top-actions .icon-btn:active{background:#eef2f7!important}

      .summary-card,
      .v177-balance-card,
      .v179-progress-card,
      .v177-flow-card,
      .v177-attention-card,
      .kpi,
      .v175-quick-card,
      .income-owner-kpi,
      .panel,
      .assistant-card,
      .list-card{
        box-shadow:0 1px 6px rgba(20,33,61,.025)!important;
      }
      .summary-card{border-color:#e7eaf0!important}
      .summary-card::after{height:2px!important;opacity:.55!important}

      #v178QuickActions .v178-quick-btn{
        background:#fff!important;
        border:1px solid #e5e9f0!important;
        color:#14213D!important;
        box-shadow:0 1px 6px rgba(20,33,61,.025)!important;
      }
      #v178QuickActions .v178-quick-btn:hover{border-color:#d8dee8!important}
      #v178QuickActions .v178-quick-btn[data-v178-action="income"] .v178-quick-icon{
        background:#edf9f6!important;color:#087F73!important;
      }
      #v178QuickActions .v178-quick-btn[data-v178-action="payment"] .v178-quick-icon{
        background:#eff4ff!important;color:#246BFD!important;
      }
      #v178QuickActions .v178-quick-btn[data-v178-action="debt"] .v178-quick-icon{
        background:#fff7e8!important;color:#c97800!important;
      }
      #v178QuickActions .v178-quick-btn[data-v178-action="expense"] .v178-quick-icon{
        background:#fff1f2!important;color:#d94750!important;
      }
      #v178QuickActions .v178-quick-icon{
        box-shadow:none!important;
        border:0!important;
      }
      #v178QuickActions .v178-quick-label{
        color:#26334d!important;
        font-weight:780!important;
      }

      .bottom-nav{
        background:rgba(255,255,255,.985)!important;
        border-top:1px solid #e7eaf0!important;
        box-shadow:0 -3px 12px rgba(20,33,61,.035)!important;
      }
      .nav-btn{
        color:#778094!important;
        background:transparent!important;
        border-radius:10px!important;
      }
      .nav-btn.active{
        color:#246BFD!important;
        background:transparent!important;
      }
      .nav-btn.active span{color:#246BFD!important}
      .nav-btn.active::before{
        left:37%!important;
        right:37%!important;
        height:2px!important;
        background:#246BFD!important;
      }
      .nav-btn small{font-weight:720!important}

      .primary{
        background:#246BFD!important;
        box-shadow:none!important;
      }
      .page-title .eyebrow{color:#087F73!important;opacity:.82!important}
      .page-title h2{color:#14213D!important}

      @media(max-width:520px){
        .topbar{
          min-height:52px!important;
          padding:calc(6px + env(safe-area-inset-top)) 12px 6px!important;
        }
        .v180-brand-logo.v182-brand-mark{width:36px!important;height:36px!important;flex-basis:36px}
        .v182-brand-copy strong{font-size:15px}
        .v182-brand-copy small{font-size:7px}
        .top-actions .icon-btn{width:36px!important;height:36px!important}
        #v178QuickActions .v178-quick-btn{min-height:56px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function simplifyHeader(){
    const left=document.querySelector('.topbar > div:first-child');
    if(!left || left.dataset.v182Header==='1') return;
    left.dataset.v182Header='1';

    const logo=left.querySelector('.v180-brand-logo') || left.querySelector('img');
    if(logo){
      logo.src='bs-budget-mark.svg?v=182';
      logo.alt='BS Bütçe Yönetimi';
      logo.classList.add('v182-brand-mark');
      logo.removeAttribute('style');
    }

    // UYUM: app.js bulut senkronu #appTitle ve orgEyebrow alanlarını kullanıyor.
    // Eski marka kopyasını DOM'dan silme; V1.8.0 CSS'i onu görünmez tutuyor.
    const legacyCopy=left.querySelector('.v180-original-brand-copy');
    if(legacyCopy){
      legacyCopy.setAttribute('aria-hidden','true');
    }

    left.querySelector('.v182-brand-copy')?.remove();

    const copy=document.createElement('div');
    copy.className='v182-brand-copy';
    copy.innerHTML='<strong>BS Bütçe</strong><small>Yönetimi</small>';
    left.appendChild(copy);

    const settings=document.querySelector('#settingsShortcut');
    if(settings){
      settings.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h-.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v-.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.36.37.7.6 1 .28.34.67.56 1.1.6h.1v4h-.1c-.43.04-.82.26-1.1.6-.23.3-.44.64-.6 1Z"/></svg>';
    }

    const install=document.querySelector('#installBtn');
    if(install){
      install.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>';
    }
  }

  function applyV182(){
    if(window.__bsBudgetV182Applied) return;
    window.__bsBudgetV182Applied=true;
    ensureStyles();
    simplifyHeader();

    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content','#f7f8fb');
  }

  waitAndApply();
})();