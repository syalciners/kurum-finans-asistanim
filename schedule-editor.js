/* BS OFİS BÜTÇE V2.3.2 - Kesin Taksit Planı ana editörü */
(() => {
  if(window.__bsScheduleEditorV232Loaded) return;
  window.__bsScheduleEditorV232Loaded=true;
  window.__bsScheduleEditorV226Loaded=true;

  const EPS=.005;
  const roundMoney=n=>Math.round((+n||0)*100)/100;
  const cloneRows=rows=>(Array.isArray(rows)?rows:[])
    .map(x=>({date:String(x?.date||''),amount:roundMoney(x?.amount)}))
    .filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&x.amount>EPS)
    .sort((a,b)=>a.date.localeCompare(b.date));
  const totalRows=rows=>roundMoney(rows.reduce((s,x)=>s+(+x.amount||0),0));

  function normalizeRecord(record={}){
    try{return typeof normalizeDebt==='function'?normalizeDebt(record):record;}
    catch(_e){return record||{};}
  }

  function activeSchedule(record={}){
    const d=normalizeRecord(record);
    const all=cloneRows(d.custom?.installment_schedule);
    if(!all.length) return [];

    const rem=d.custom?.remaining_installments;
    if(rem===''||rem==null||Number.isNaN(+rem)) return all;

    const count=Math.max(0,Math.min(all.length,Math.floor(+rem)));
    return all.slice(Math.max(0,all.length-count));
  }

  function planState(record={}){
    const d=normalizeRecord(record);
    const exact=activeSchedule(d);
    const remRaw=d.custom?.remaining_installments;
    const remaining=remRaw===''||remRaw==null||Number.isNaN(+remRaw)
      ?null
      :Math.max(0,Math.floor(+remRaw));

    let summary=null;
    try{
      summary=typeof window.bsDebtPlanSummary==='function'
        ?window.bsDebtPlanSummary(d)
        :null;
    }catch(_e){summary=null;}

    const summaryRows=Array.isArray(summary?.rows)?summary.rows:[];
    const enginePlan=!!(
      summary &&
      summary.kind!=='closed' &&
      summary.kind!=='unknown' &&
      summaryRows.length>0
    );
    const fieldPlan=!!(
      d.status!=='closed' &&
      d.dueDate &&
      +d.minimum>EPS &&
      remaining!=null &&
      remaining>0
    );

    return {
      d,
      exact,
      remaining,
      summary,
      hasExact:exact.length>0,
      hasPlan:exact.length>0 || enginePlan || fieldPlan
    };
  }

  function monthlyDate(startDate,offset){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return '';
    const [y0,m0,d0]=startDate.split('-').map(Number);
    const raw=(m0-1)+offset;
    const y=y0+Math.floor(raw/12);
    const m=((raw%12)+12)%12;
    const lastDay=new Date(Date.UTC(y,m+1,0)).getUTCDate();
    const d=Math.min(d0,lastDay);
    return `${String(y).padStart(4,'0')}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  function buildMonthlyRows(startDate,count,amount){
    const n=Math.max(0,Math.min(120,Math.floor(+count||0)));
    const a=roundMoney(amount);
    if(!startDate||n<1||a<=EPS) return [];
    return Array.from({length:n},(_,i)=>({date:monthlyDate(startDate,i),amount:a}));
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
      .bs-schedule-generator{padding:9px;border:1px solid #dbe7fb;border-radius:12px;background:#f8fbff;display:grid;gap:7px}
      .bs-schedule-generator[hidden]{display:none!important}
      .bs-schedule-generator-head{display:grid;gap:1px}.bs-schedule-generator-head strong{font-size:10px;color:#0f172a}.bs-schedule-generator-head small{font-size:8.5px;color:#64748b;line-height:1.35}
      .bs-schedule-generator-grid{display:grid;grid-template-columns:1.15fr .72fr .9fr;gap:6px}.bs-schedule-generator-grid label{display:grid;gap:4px;font-size:8px;font-weight:760;color:#64748b}.bs-schedule-generator-grid input{min-width:0;min-height:38px;padding:7px 8px;font-size:10.5px}
      .bs-schedule-generate{min-height:35px;border:1px solid #b9cef8;border-radius:10px;background:#eff6ff;color:#2563eb;font-size:9px;font-weight:830;cursor:pointer}
      .bs-schedule-rebuild{min-height:34px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#475569;font-size:9px;font-weight:820;cursor:pointer}
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
      @media(max-width:520px){.bs-schedule-row{grid-template-columns:1fr .78fr 30px}.bs-schedule-editor-head{padding:10px}.bs-schedule-editor-body{padding:9px 10px 11px}.bs-schedule-generator-grid{grid-template-columns:1fr 1fr}.bs-schedule-generator-grid label:first-child{grid-column:1/-1}}
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

  function editorHasPlan(editor){
    if(!editor || editor.dataset.cleared==='1') return false;
    return editor.dataset.basePlan==='1' || rowsFromEditor(editor).length>0;
  }

  function updateSummary(editor){
    if(!editor) return;
    const rows=rowsFromEditor(editor);
    const sum=totalRows(rows);
    const summary=editor.querySelector('.bs-schedule-summary');
    const empty=editor.querySelector('.bs-schedule-empty');
    const clear=editor.querySelector('.bs-schedule-clear');

    if(summary){
      summary.innerHTML=rows.length
        ?`<strong>${rows.length} ödeme</strong> · toplam <strong>${money(sum)}</strong> · ilk ödeme ${parseDate(rows[0].date).toLocaleDateString('tr-TR')}`
        :(editor.dataset.basePlan==='1'
          ?'Mevcut taksit planı kayıtlı. Kesin tarih/tutar satırları eklemek istersen planı açabilirsin.'
          :'Henüz plan satırı yok.');
    }
    if(empty) empty.hidden=rows.length>0 || editor.dataset.basePlan==='1';
    if(clear) clear.hidden=rows.length===0;

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

  function configureGenerator(editor,ps){
    const generator=editor.querySelector('.bs-schedule-generator');
    if(!generator) return;

    const head=generator.querySelector('.bs-schedule-generator-head strong');
    const small=generator.querySelector('.bs-schedule-generator-head small');
    const start=generator.querySelector('[data-generator-start]');
    const count=generator.querySelector('[data-generator-count]');
    const amount=generator.querySelector('[data-generator-amount]');

    if(ps.hasExact){
      generator.hidden=true;
      const rebuild=document.createElement('button');
      rebuild.type='button';
      rebuild.className='bs-schedule-rebuild';
      rebuild.textContent='Planı Yeniden Oluştur';
      generator.insertAdjacentElement('beforebegin',rebuild);
      rebuild.addEventListener('click',()=>{
        generator.hidden=!generator.hidden;
        rebuild.textContent=generator.hidden?'Planı Yeniden Oluştur':'Yeniden Oluşturmayı Kapat';
      });
      return;
    }

    generator.hidden=false;
    if(ps.hasPlan){
      if(head) head.textContent='Mevcut planı kesinleştir';
      if(small) small.textContent='Mevcut aylık plan bilgilerini gerçek tarih ve tutar satırlarına dönüştürür. Kaydetmeden önce satırları kontrol edebilirsin.';
      if(start) start.value=ps.d.dueDate||'';
      if(count && ps.remaining>0) count.value=String(ps.remaining);
      if(amount && +ps.d.minimum>EPS) amount.value=String(+ps.d.minimum);
    }
  }

  function installEditor(record={}){
    const fields=document.querySelector('#recordFields');
    if(!fields || fields.querySelector('.bs-schedule-editor')) return;

    const ps=planState(record);
    const rows=ps.exact;
    const label=String(
      ps.d.custom?.installment_schedule_label
      ||ps.d.custom?.installment_schedule_provider
      ||''
    );
    const planCount=ps.remaining!=null?ps.remaining:rows.length;

    const editor=document.createElement('section');
    editor.className='bs-schedule-editor';
    editor.dataset.cleared='0';
    editor.dataset.hadSchedule=rows.length?'1':'0';
    editor.dataset.basePlan=ps.hasPlan?'1':'0';
    editor.dataset.generated='0';
    editor.innerHTML=`
      <div class="bs-schedule-editor-head">
        <div class="bs-schedule-editor-title">
          <strong>Kesin Taksit Planı</strong>
          <small>${ps.hasExact
            ?`${planCount||rows.length} kesin ödeme kayıtlı · tarih ve tutarlar düzenlenebilir`
            :ps.hasPlan
              ?`${planCount?`${planCount} taksitlik `:''}mevcut plan kayıtlı`
              :'Banka veya kredi planını tarih ve tutar satırlarıyla tanımla'}</small>
        </div>
        <button type="button" class="bs-schedule-editor-toggle" aria-expanded="false">${ps.hasPlan?'Planı Düzenle':'Plan Ekle'}</button>
      </div>
      <div class="bs-schedule-editor-body" hidden>
        <label class="bs-schedule-label">Plan adı / sağlayıcı
          <input type="text" data-schedule-label maxlength="50" value="${esc(label)}" placeholder="Örn. Banka kredi planı">
        </label>
        <div class="bs-schedule-generator">
          <div class="bs-schedule-generator-head">
            <strong>Hızlı aylık plan oluştur</strong>
            <small>Başlangıç tarihi, taksit sayısı ve aylık tutardan satırları otomatik üretir. Gerekirse sonradan tek tek düzenleyebilirsin.</small>
          </div>
          <div class="bs-schedule-generator-grid">
            <label>İlk ödeme tarihi<input type="date" data-generator-start></label>
            <label>Taksit sayısı<input type="number" data-generator-count min="1" max="120" step="1" inputmode="numeric" placeholder="12"></label>
            <label>Aylık tutar<input type="number" data-generator-amount min="0.01" step="0.01" inputmode="decimal" placeholder="5000"></label>
          </div>
          <button type="button" class="bs-schedule-generate">Aylık Planı Oluştur</button>
        </div>
        <div class="bs-schedule-rows">${rows.map(rowHtml).join('')}</div>
        <div class="bs-schedule-empty">İlk ödeme satırını ekleyerek başlayın.</div>
        <div class="bs-schedule-summary"></div>
        <div class="bs-schedule-actions">
          <button type="button" class="bs-schedule-add">＋ Ödeme Satırı</button>
          <button type="button" class="bs-schedule-clear">Planı Temizle</button>
        </div>
      </div>`;

    fields.appendChild(editor);
    configureGenerator(editor,ps);

    const body=editor.querySelector('.bs-schedule-editor-body');
    const toggle=editor.querySelector('.bs-schedule-editor-toggle');
    toggle.addEventListener('click',()=>{
      const open=body.hidden;
      body.hidden=!open;
      toggle.setAttribute('aria-expanded',open?'true':'false');
      toggle.textContent=open?'Planı Kapat':(editorHasPlan(editor)?'Planı Düzenle':'Plan Ekle');
      if(open && !ps.hasPlan && !rowsFromEditor(editor).length) addRow(editor);
    });

    editor.querySelector('.bs-schedule-generate').addEventListener('click',()=>{
      const start=editor.querySelector('[data-generator-start]')?.value||'';
      const count=editor.querySelector('[data-generator-count]')?.value||'';
      const amount=editor.querySelector('[data-generator-amount]')?.value||'';
      const generated=buildMonthlyRows(start,count,amount);

      if(!generated.length){
        toast('İlk ödeme tarihi, taksit sayısı ve aylık tutarı kontrol edin.');
        return;
      }

      const existing=rowsFromEditor(editor);
      if(existing.length && !confirm(`Mevcut ${existing.length} plan satırı yeni aylık planla değiştirilecek. Devam edilsin mi?`)) return;

      editor.dataset.cleared='0';
      editor.dataset.basePlan='1';
      editor.dataset.generated='1';
      editor.querySelector('.bs-schedule-rows').innerHTML=generated.map(rowHtml).join('');
      updateSummary(editor);
      toast(`${generated.length} taksitlik aylık plan oluşturuldu.`);
    });

    editor.querySelector('.bs-schedule-add').addEventListener('click',()=>{
      editor.dataset.generated='0';
      addRow(editor);
    });

    editor.querySelector('.bs-schedule-clear').addEventListener('click',()=>{
      if(!confirm('Kesin taksit planını temizlemek istiyor musunuz?')) return;
      editor.dataset.cleared='1';
      editor.dataset.generated='0';
      editor.dataset.basePlan=ps.hasExact?'0':(ps.hasPlan?'1':'0');
      editor.querySelector('.bs-schedule-rows').innerHTML='';
      updateSummary(editor);
    });

    editor.addEventListener('click',e=>{
      const btn=e.target.closest('.bs-schedule-remove');
      if(!btn) return;
      btn.closest('.bs-schedule-row')?.remove();
      editor.dataset.generated='0';
      const anyRows=editor.querySelectorAll('.bs-schedule-row').length>0;
      if(anyRows){
        editor.dataset.cleared='0';
        editor.dataset.basePlan='1';
      }else if(editor.dataset.hadSchedule==='1'){
        editor.dataset.cleared='1';
        editor.dataset.basePlan='0';
      }
      updateSummary(editor);
    });

    editor.addEventListener('input',e=>{
      if(e.target.closest('.bs-schedule-generator')) return;
      editor.dataset.generated='0';
      if(editor.querySelectorAll('.bs-schedule-row').length){
        editor.dataset.cleared='0';
        editor.dataset.basePlan='1';
      }
      updateSummary(editor);
    });
    editor.addEventListener('change',e=>{
      if(e.target.closest('.bs-schedule-generator')) return;
      editor.dataset.generated='0';
      if(editor.querySelectorAll('.bs-schedule-row').length){
        editor.dataset.cleared='0';
        editor.dataset.basePlan='1';
      }
      updateSummary(editor);
    });

    updateSummary(editor);
  }

  if(typeof openRecordDialog==='function' && !openRecordDialog.__bsScheduleEditorV232){
    const originalOpenRecordDialogV232=openRecordDialog;
    const wrapped=function(module,record=null){
      const result=originalOpenRecordDialogV232(module,record);
      if(module==='debts') installEditor(record||{});
      return result;
    };
    wrapped.__bsScheduleEditorV232=true;
    openRecordDialog=wrapped;
  }

  if(typeof parseCustomValues==='function' && !parseCustomValues.__bsScheduleEditorV232){
    const originalParseCustomValuesV232=parseCustomValues;
    const wrapped=function(fd,module,oldCustom={}){
      const out=originalParseCustomValuesV232(fd,module,oldCustom);
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
      out.installment_schedule_source=editor.dataset.generated==='1'
        ?'hizli_aylik_plan_v232'
        :'uygulama_editoru_v232';
      if(label) out.installment_schedule_label=label;
      else delete out.installment_schedule_label;
      delete out.next_payment_after_current;
      delete out.next_payment_source;
      return out;
    };
    wrapped.__bsScheduleEditorV232=true;
    parseCustomValues=wrapped;
  }

  ensureStyles();
})();
