/* BS OFİS BÜTÇE V2.2.7 - Kesin taksit planı düzenleme UX */
(() => {
  if(window.__bsScheduleEditorUxV227Loaded) return;
  window.__bsScheduleEditorUxV227Loaded=true;

  function tuneEditor(record={}){
    const editor=document.querySelector('#recordFields .bs-schedule-editor');
    if(!editor) return;

    const body=editor.querySelector('.bs-schedule-editor-body');
    const toggle=editor.querySelector('.bs-schedule-editor-toggle');
    const generator=editor.querySelector('.bs-schedule-generator');
    const rows=[...editor.querySelectorAll('.bs-schedule-row')];
    const hasPlan=rows.length>0 || Array.isArray(record?.custom?.installment_schedule) && record.custom.installment_schedule.length>0;

    if(!body || !toggle) return;

    if(hasPlan){
      body.hidden=true;
      toggle.setAttribute('aria-expanded','false');
      toggle.textContent='Planı Düzenle';

      if(generator){
        generator.hidden=true;
        if(!editor.querySelector('.bs-schedule-rebuild')){
          const rebuild=document.createElement('button');
          rebuild.type='button';
          rebuild.className='bs-schedule-rebuild';
          rebuild.textContent='Planı Yeniden Oluştur';
          rebuild.style.cssText='min-height:34px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#475569;font-size:9px;font-weight:820;cursor:pointer';
          generator.insertAdjacentElement('beforebegin',rebuild);
          rebuild.addEventListener('click',()=>{
            generator.hidden=!generator.hidden;
            rebuild.textContent=generator.hidden?'Planı Yeniden Oluştur':'Yeniden Oluşturmayı Kapat';
          });
        }
      }
    }else{
      toggle.textContent='Plan Ekle';
      if(generator) generator.hidden=false;
    }
  }

  if(typeof openRecordDialog==='function' && !openRecordDialog.__bsScheduleEditorUxV227){
    const originalOpenRecordDialogV227=openRecordDialog;
    const wrapped=function(module,record=null){
      const result=originalOpenRecordDialogV227(module,record);
      if(module==='debts') tuneEditor(record||{});
      return result;
    };
    wrapped.__bsScheduleEditorUxV227=true;
    openRecordDialog=wrapped;
  }
})();
