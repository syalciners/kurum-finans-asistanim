/* BS OFİS BÜTÇE V2.2.5 - Kesin Taksit Planı form editörü */
(() => {
  if(window.__bsScheduleEditorV225Loaded) return;
  window.__bsScheduleEditorV225Loaded=true;

  const EPS=.005;
  const roundMoney=n=>Math.round((+n||0)*100)/100;
  const cloneRows=rows=>(Array.isArray(rows)?rows:[])
    .map(x=>({date:String(x?.date||''),amount:roundMoney(x?.amount)}))
    .filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&x.amount>EPS)
    .sort((a,b)=>a.date.localeCompare(b.date));
  const totalRows=rows=>roundMoney(rows.reduce((s,x)=>s+(+x.amount||0),0));

  function activeSchedule(record={}){
    const all=cloneRows(record.custom?.installment_schedule);
    if(!all.length) return [];

    const rem=record.custom?.remaining_installments;
    if(rem===''||rem==null||Number.isNaN(+rem)) return all;

    const count=Math.max(0,Math.min(all.length,Math.floor(+rem)));
    return all.slice(Math.max(0,all.length-count));
  }

  function ensureStyles(){
    if(document.querySelector('#bsScheduleEditorStyles')) return;
    const style=document.createElement('style');
    style.id='bsScheduleEditorStyles';
    style.textContent=`
      .bs-schedule-editor{margin-top:4px;border:1px solid var(--line,#e2e8f0);border-radius:15px;background:#fff;overflow:hidden}
      .bs-schedule-editor-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;background:#f8fafc}
      .bs-schedule-editor-title{display:grid;gap:2px;min-width:0}.bs-schedule-editor-title strong{font-size:11px;color:#0f172a}.bs-schedule-editor-title small{font-size:9px;color:#64748b;line-height:1.35}
      .bs-schedule-editor-toggle{flex:0 0 auto;min-height:32px;padding:6px 9px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#2563eb;font-size:9px;font-weight:820;cursor:pointer}
      .bs-schedule-editor-body{padding:10px 12px 12px;border-top:1px solid #e8edf3;display:grid;gap:9px}
      .bs-schedule-editor-body[hidden]{display:none!important}
      .bs-schedule-label{display:grid;gap:5px;font-size:9px;font-weight:760;color:#64748b}.bs-schedule-label input{min-height:40px}
      .bs-schedule-rows{display:grid;gap:7px;max-height:310px;overflow:auto;padding-right:2px}
      .bs-schedule-row{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr) 32px;gap:6px;align-items:center}
      .bs-schedule-row input{min-width:0;min-height:39px;padding:8px 9px;font-size:11px}
      .bs-schedule-remove{width:32px;height:32px;padding:0;border:1px solid #fecaca;border-radius:9px;background:#fff;color:#dc2626;font-size:16px;line-height:1;cursor:pointer}
      .bs-schedule-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
      .bs-schedule-add,.bs-schedule-clear{min-height:34px;padding:7px 10px;border-radius:10px;font-size:9px;font-weight:820;cursor:pointer}
      .bs-schedule-add{border:1px solid #bfd0f7;background:#eff6ff;color:#2563eb}.bs-schedule-clear{border:1px solid #fecaca;background:#fff;color:#dc2626}
      .bs-schedule-summary{padding:8px 9px;border-radius:10px;background:#f8fafc;color:#475569;font-size:9px;font-weight:760;line-height:1.4}
      .bs-schedule-summary strong{color:#2563eb}
      .bs-schedule-empty{padding:9px;border:1px dashed #cbd5e1;border-radius:10px;color:#64748b;font-size:9px;line-height:1.4;text-align:center}
      @media(max-width:520px){.bs-schedule-row{grid-template-columns:1fr .78fr 30px}.bs-schedule-editor-head{padding:10px}.bs-schedule-editor-body{padding:9px 10px 11px}}
    `;
    document.head.appendChild(style);
  }

  function rowHtml(row={}){
    return `
      <div class="bs-schedule-row">
        <input type="date" data-schedule-date value="${esc(row.date||'')}" aria-label="Ödeme tarihi">
        <input type="number" data-schedule-amount min="0.01" step="0.01" inputmode="decimal" value="${esc(row.amount||'')}" placeholder="Tutar" aria-label="Ödeme tutarı">
        <button type="button" class="bs-schedule-remove" title="Satırı sil" aria-label="Satırı sil">×</button>
      </div>`;
  }

  function rowsFromEditor(editor){
    if(!editor || editor.dataset.cleared==='1') return [];
    return [...editor.querySelectorAll('.bs-schedule-row')]
      .map(row=>({
        date:row.querySelector('[data-schedule-date]')?.value||'',
        amount:roundMoney(row.querySelector('[data-schedule-amount]')?.value)
      }))
      .filter(x=>x.date&&x.amount>EPS)
      .sort((a,b)=>a.date.localeCompare(b.date));
  }

  function updateSummary(editor){
    if(!editor) return;
    const rows=rowsFromEditor(editor);
    const sum=totalRows(rows);
    const summary=editor.querySelector('.bs-schedule-summary');
    const empty=editor.querySelector('.bs-schedule-empty');

    if(summary){
      summary.innerHTML=rows.length
        ?`<strong>${rows.length} ödeme</strong> · toplam <strong>${money(sum)}</strong> · ilk ödeme ${parseDate(rows[0].date).toLocaleDateString('tr-TR')}`
        :'Henüz plan satırı yok.';
    }
    if(empty) empty.hidden=rows.length>0;

    const form=document.querySelector('#recordForm');
    if(!form || form.querySelector('[name="module"]')?.value!=='debts') return;

    const set=(name,value)=>{
      const input=form.querySelector(`[name="${name}"]`);
      if(input) input.value=value;
    };

    if(rows.length){
      set('dueDate',rows[0].date);
      set('minimum',rows[0].amount);
      set('balance',sum);
      set('custom__remaining_installments',rows.length);
    }
  }

  function addRow(editor,row={}){
    const box=editor?.querySelector('.bs-schedule-rows');
    if(!box) return;
    editor.dataset.cleared='0';
    box.insertAdjacentHTML('beforeend',rowHtml(row));
    updateSummary(editor);
    box.lastElementChild?.querySelector('[data-schedule-date]')?.focus();
  }

  function clearScheduleFromCustom(out){
    delete out.installment_schedule;
    delete out.installment_schedule_total;
    delete out.installment_schedule_label;
    delete out.installment_schedule_provider;
    delete out.installment_schedule_source;
    if(out.plan_type==='exact_schedule'||out.plan_type==='exact_bank_schedule') delete out.plan_type;
  }

  function installEditor(record={}){
    const fields=document.querySelector('#recordFields');
    if(!fields || fields.querySelector('.bs-schedule-editor')) return;

    const rows=activeSchedule(record);
    const label=String(
      record.custom?.installment_schedule_label
      ||record.custom?.installment_schedule_provider
      ||''
    );

    const editor=document.createElement('section');
    editor.className='bs-schedule-editor';
    editor.dataset.cleared='0';
    editor.dataset.hadSchedule=rows.length?'1':'0';
    editor.innerHTML=`
      <div class="bs-schedule-editor-head">
        <div class="bs-schedule-editor-title">
          <strong>Kesin Taksit Planı</strong>
          <small>${rows.length?`${rows.length} kayıtlı ödeme · plan alanları otomatik eşitlenir`:'Banka veya kredi planını tarih ve tutar satırlarıyla tanımla'}</small>
        </div>
        <button type="button" class="bs-schedule-editor-toggle" aria-expanded="${rows.length?'true':'false'}">${rows.length?'Planı Kapat':'Plan Ekle'}</button>
      </div>
      <div class="bs-schedule-editor-body" ${rows.length?'':'hidden'}>
        <label class="bs-schedule-label">Plan adı / sağlayıcı
          <input type="text" data-schedule-label maxlength="50" value="${esc(label)}" placeholder="Örn. Banka kredi planı">
        </label>
        <div class="bs-schedule-rows">${rows.map(rowHtml).join('')}</div>
        <div class="bs-schedule-empty" ${rows.length?'hidden':''}>İlk ödeme satırını ekleyerek başlayın.</div>
        <div class="bs-schedule-summary"></div>
        <div class="bs-schedule-actions">
          <button type="button" class="bs-schedule-add">＋ Ödeme Satırı</button>
          <button type="button" class="bs-schedule-clear">Planı Temizle</button>
        </div>
      </div>`;

    fields.appendChild(editor);

    const body=editor.querySelector('.bs-schedule-editor-body');
    const toggle=editor.querySelector('.bs-schedule-editor-toggle');
    toggle.addEventListener('click',()=>{
      const open=body.hidden;
      body.hidden=!open;
      toggle.setAttribute('aria-expanded',open?'true':'false');
      toggle.textContent=open?'Planı Kapat':(rowsFromEditor(editor).length?'Planı Düzenle':'Plan Ekle');
      if(open && !rowsFromEditor(editor).length) addRow(editor);
    });

    editor.querySelector('.bs-schedule-add').addEventListener('click',()=>addRow(editor));
    editor.querySelector('.bs-schedule-clear').addEventListener('click',()=>{
      if(!confirm('Kesin taksit planını temizlemek istiyor musunuz?')) return;
      editor.dataset.cleared='1';
      editor.querySelector('.bs-schedule-rows').innerHTML='';
      updateSummary(editor);
    });

    editor.addEventListener('click',e=>{
      const btn=e.target.closest('.bs-schedule-remove');
      if(!btn) return;
      btn.closest('.bs-schedule-row')?.remove();
      const anyRows=editor.querySelectorAll('.bs-schedule-row').length>0;
      editor.dataset.cleared=(!anyRows && editor.dataset.hadSchedule==='1')?'1':'0';
      updateSummary(editor);
    });
    editor.addEventListener('input',()=>{
      if(editor.querySelectorAll('.bs-schedule-row').length) editor.dataset.cleared='0';
      updateSummary(editor);
    });
    editor.addEventListener('change',()=>{
      if(editor.querySelectorAll('.bs-schedule-row').length) editor.dataset.cleared='0';
      updateSummary(editor);
    });

    updateSummary(editor);
  }

  if(typeof openRecordDialog==='function' && !openRecordDialog.__bsScheduleEditorV225){
    const originalOpenRecordDialogV225=openRecordDialog;
    const wrapped=function(module,record=null){
      const result=originalOpenRecordDialogV225(module,record);
      if(module==='debts') installEditor(record||{});
      return result;
    };
    wrapped.__bsScheduleEditorV225=true;
    openRecordDialog=wrapped;
  }

  if(typeof parseCustomValues==='function' && !parseCustomValues.__bsScheduleEditorV225){
    const originalParseCustomValuesV225=parseCustomValues;
    const wrapped=function(fd,module,oldCustom={}){
      const out=originalParseCustomValuesV225(fd,module,oldCustom);
      if(module!=='debts') return out;

      const editor=document.querySelector('#recordFields .bs-schedule-editor');
      if(!editor) return out;

      const rows=rowsFromEditor(editor);
      if(editor.dataset.cleared==='1' || (!rows.length && editor.dataset.hadSchedule==='1')){
        clearScheduleFromCustom(out);
        return out;
      }

      if(!rows.length) return out;

      const label=editor.querySelector('[data-schedule-label]')?.value.trim()||'';
      out.installment_schedule=rows;
      out.installment_schedule_total=totalRows(rows);
      out.remaining_installments=rows.length;
      out.plan_type='exact_schedule';
      out.installment_schedule_source='uygulama_editoru_v225';
      if(label) out.installment_schedule_label=label;
      else delete out.installment_schedule_label;
      delete out.next_payment_after_current;
      delete out.next_payment_source;
      return out;
    };
    wrapped.__bsScheduleEditorV225=true;
    parseCustomValues=wrapped;
  }

  ensureStyles();
})();
