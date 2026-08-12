/* BS OFİS BÜTÇE V1.7.8 - Hızlı işlemler */
(() => {
  function ensureV178Styles(){
    if(document.querySelector('#v178Styles')) return;

    const style = document.createElement('style');
    style.id = 'v178Styles';
    style.textContent = `
      .v178-quick-actions{
        margin:0 0 18px;
      }
      .v178-quick-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin:0 2px 8px;
      }
      .v178-quick-head strong{
        font-size:12px;
      }
      .v178-quick-head small{
        color:var(--muted);
        font-size:10px;
      }
      .v178-quick-grid{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:8px;
      }
      .v178-quick-btn{
        appearance:none;
        border:1px solid var(--line);
        background:var(--card);
        color:var(--ink);
        border-radius:13px;
        min-height:66px;
        padding:9px 7px;
        display:grid;
        justify-items:center;
        align-content:center;
        gap:5px;
        cursor:pointer;
        box-shadow:0 3px 12px rgba(20,33,61,.03);
        -webkit-tap-highlight-color:transparent;
        transition:transform .15s ease,border-color .15s ease,background .15s ease;
      }
      .v178-quick-btn:hover{
        border-color:#b9cbef;
      }
      .v178-quick-btn:active{
        transform:scale(.985);
        background:#f7f9fe;
      }
      .v178-quick-btn:focus-visible{
        outline:2px solid #8eb1ff;
        outline-offset:2px;
      }
      .v178-quick-icon{
        width:28px;
        height:28px;
        border-radius:9px;
        display:grid;
        place-items:center;
        background:#eef4ff;
        color:var(--accent);
        font-size:17px;
        font-weight:850;
      }
      .v178-quick-btn span:last-child{
        font-size:10px;
        font-weight:800;
        line-height:1.15;
        text-align:center;
      }
      @media(max-width:380px){
        .v178-quick-grid{gap:6px}
        .v178-quick-btn{padding:8px 4px;min-height:62px}
        .v178-quick-btn span:last-child{font-size:9px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureQuickActions(){
    const dashboard = document.querySelector('#dashboard');
    const panel = document.querySelector('#v177DashboardPanel');
    if(!dashboard || !panel || document.querySelector('#v178QuickActions')) return;

    const wrap = document.createElement('section');
    wrap.id = 'v178QuickActions';
    wrap.className = 'v178-quick-actions';
    wrap.innerHTML = `
      <div class="v178-quick-head">
        <strong>Hızlı İşlemler</strong>
        <small>tek dokunuş</small>
      </div>
      <div class="v178-quick-grid">
        <button type="button" class="v178-quick-btn" data-v178-action="income" aria-label="Yeni gelir ekle">
          <span class="v178-quick-icon">＋₺</span>
          <span>Gelir Ekle</span>
        </button>
        <button type="button" class="v178-quick-btn" data-v178-action="payment" aria-label="Yeni borç ödemesi yap">
          <span class="v178-quick-icon">✓</span>
          <span>Ödeme Yap</span>
        </button>
        <button type="button" class="v178-quick-btn" data-v178-action="debt" aria-label="Yeni borç ekle">
          <span class="v178-quick-icon">▤</span>
          <span>Borç Ekle</span>
        </button>
        <button type="button" class="v178-quick-btn" data-v178-action="expense" aria-label="Yeni harcama ekle">
          <span class="v178-quick-icon">−₺</span>
          <span>Harcama Ekle</span>
        </button>
      </div>
    `;

    panel.insertAdjacentElement('afterend',wrap);

    wrap.addEventListener('click', e => {
      const btn = e.target.closest('[data-v178-action]');
      if(!btn) return;

      const action = btn.dataset.v178Action;

      if(action === 'income'){
        openIncomeDialog();
        return;
      }

      if(action === 'payment'){
        if(!activeDebts().length){
          toast('Ödeme yapmak için önce aktif bir borç ekleyin.');
          return;
        }
        openRecordDialog('payments',{date:todayISO()});
        return;
      }

      if(action === 'debt'){
        openRecordDialog('debts');
        return;
      }

      if(action === 'expense'){
        openRecordDialog('expenses');
      }
    });
  }

  ensureV178Styles();
  ensureQuickActions();

  const originalRenderDashboardV178 = renderDashboard;
  renderDashboard = function(){
    originalRenderDashboardV178();
    ensureQuickActions();
  };

  // V1.7.9 görsel iyileştirme modülünü yükle.
  if(!document.querySelector('script[data-v179-loader]')){
    const script = document.createElement('script');
    script.src = 'v179-ui.js?v=179';
    script.dataset.v179Loader = '1';
    document.head.appendChild(script);
  }
})();