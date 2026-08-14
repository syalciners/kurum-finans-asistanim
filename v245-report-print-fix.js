/* BS OFİS BÜTÇE V2.4.5 - Kurumsal rapor baskı düzeltmesi */
(() => {
  if(window.__bsReportPrintFixV245Loaded) return;
  window.__bsReportPrintFixV245Loaded = true;

  const originalOpen = window.open.bind(window);

  window.open = function(...args){
    const reportWindow = originalOpen(...args);
    if(!reportWindow || args[0] !== '') return reportWindow;

    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      try{
        const doc = reportWindow.document;
        if(!doc || !/Finans Raporu/i.test(doc.title || '')){
          if(tries > 40) clearInterval(timer);
          return;
        }

        if(!doc.getElementById('v245ReportPrintFix')){
          const style = doc.createElement('style');
          style.id = 'v245ReportPrintFix';
          style.textContent = `
            @media print{
              @page{size:A4;margin:0}
              body{background:#fff}
              .page{
                width:auto!important;
                min-height:auto!important;
                margin:0!important;
                padding:12mm!important;
                box-shadow:none!important;
              }
              h2{
                break-after:avoid-page;
                page-break-after:avoid;
              }
              .section>h2+table{
                break-before:avoid-page;
                page-break-before:avoid;
              }
            }
          `;
          doc.head.appendChild(style);
        }

        clearInterval(timer);
      }catch(_e){
        if(tries > 40) clearInterval(timer);
      }
    }, 10);

    return reportWindow;
  };
})();
