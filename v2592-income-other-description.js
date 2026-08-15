/* BS OFİS BÜTÇE V2.5.9.2 - Diğer gelir türü ve açıklama alanı
   Yalnız manuel gelir akışını genişletir. Otomatik özel ders gelirlerine dokunmaz. */
(() => {
  if(window.__bsIncomeOtherDescriptionV2592Loaded) return;
  window.__bsIncomeOtherDescriptionV2592Loaded = true;

  const OTHER = 'Diğer';

  function incomeForm(){ return document.getElementById('incomeForm'); }

  function ensureUi(){
    const form = incomeForm();
    const type = form?.querySelector('[name="type"]');
    if(!form || !type) return;

    if(!type.querySelector(`option[value="${OTHER}"]`)){
      const option = document.createElement('option');
      option.value = OTHER;
      option.textContent = OTHER;
      type.appendChild(option);
    }

    const filter = document.getElementById('incomeTypeFilter');
    if(filter && !filter.querySelector(`option[value="${OTHER}"]`)){
      const option = document.createElement('option');
      option.value = OTHER;
      option.textContent = OTHER;
      filter.appendChild(option);
    }

    let wrap = document.getElementById('incomeDescriptionWrap');
    if(!wrap){
      wrap = document.createElement('label');
      wrap.id = 'incomeDescriptionWrap';
      wrap.className = 'hidden';
      wrap.innerHTML = 'Açıklama<input name="description" type="text" maxlength="120" placeholder="Gelirin açıklamasını yazın" autocomplete="off" />';
      const studentWrap = document.getElementById('incomeStudentWrap');
      (studentWrap || type.closest('label'))?.insertAdjacentElement('afterend',wrap);
    }

    if(!type.__bsV2592Bound){
      type.addEventListener('change',syncVisibility);
      type.__bsV2592Bound = true;
    }

    syncVisibility();
  }

  function syncVisibility(){
    const form = incomeForm();
    const type = form?.querySelector('[name="type"]');
    const wrap = document.getElementById('incomeDescriptionWrap');
    const input = wrap?.querySelector('[name="description"]');
    if(!type || !wrap || !input) return;

    const show = type.value === OTHER;
    wrap.classList.toggle('hidden',!show);
    wrap.setAttribute('aria-hidden',show ? 'false' : 'true');
    input.required = show;
  }

  function installNormalizer(){
    if(typeof normalizeIncome !== 'function' || normalizeIncome.__bsV2592Description) return;
    const original = normalizeIncome;
    const wrapped = function(input={}){
      const result = original(input);
      result.description = String(input?.description ?? input?.aciklama ?? result?.description ?? '').trim();
      return result;
    };
    wrapped.__bsV2592Description = true;
    normalizeIncome = wrapped;
  }

  function installCloudWriter(){
    if(typeof cloudUpsertIncome !== 'function' || cloudUpsertIncome.__bsV2592Description) return;
    const original = cloudUpsertIncome;
    const wrapped = async function(income){
      const normalized = typeof normalizeIncome === 'function' ? normalizeIncome(income) : income;
      if(normalized?.type !== OTHER){
        return original.call(this,normalized);
      }

      if(!sb || !session) return original.call(this,normalized);

      const response = await sb.from('gelirler').upsert({
        id:normalized.id,
        user_id:session.user.id,
        gelir_sahibi:normalized.owner,
        gelir_turu:normalized.type,
        ogrenci_adi:null,
        gelir_tarihi:normalized.date,
        tutar:normalized.amount,
        ekleyen:normalized.addedBy || deviceName(),
        kaynak:normalized.source || null,
        kaynak_kayit_id:normalized.sourceRecordId || null,
        kaynak_ogrenci_id:normalized.sourceStudentId || null,
        otomatik_aktarim:!!normalized.automatic,
        aciklama:normalized.description || null,
        olusturma_zamani:normalized.createdAt,
        guncelleme_zamani:normalized.updatedAt
      },{onConflict:'id'});

      return typeof checkErr === 'function' ? checkErr(response,'Gelir') : response;
    };
    wrapped.__bsV2592Description = true;
    cloudUpsertIncome = wrapped;
  }

  function installOpenHook(){
    if(typeof openIncomeDialog !== 'function' || openIncomeDialog.__bsV2592Description) return;
    const original = openIncomeDialog;
    const wrapped = function(income={}){
      ensureUi();
      const normalized = typeof normalizeIncome === 'function' ? normalizeIncome(income) : income;
      const result = original.call(this,income);
      ensureUi();
      const input = incomeForm()?.querySelector('[name="description"]');
      if(input) input.value = normalized?.description || '';
      syncVisibility();
      return result;
    };
    wrapped.__bsV2592Description = true;
    openIncomeDialog = wrapped;
  }

  function installSubmitGuard(){
    const form = incomeForm();
    if(!form || form.__bsV2592Submit) return;

    form.addEventListener('submit',async event => {
      const type = form.querySelector('[name="type"]')?.value || '';
      if(type !== OTHER) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const fd = Object.fromEntries(new FormData(form));
      const description = String(fd.description || '').trim();
      const amount = Number(fd.amount || 0);
      if(!description){
        if(typeof toast === 'function') toast('Diğer gelir için açıklama girin.');
        return;
      }
      if(!(amount > 0)) return;

      const now = new Date().toISOString();
      const id = fd.id || uid();
      const old = state.incomes.map(normalizeIncome).find(x => x.id === id);
      const obj = normalizeIncome({
        id,
        owner:fd.owner,
        type:OTHER,
        student:'',
        description,
        date:fd.date,
        amount,
        addedBy:old?.addedBy || deviceName(),
        source:old?.source || '',
        sourceRecordId:old?.sourceRecordId || '',
        sourceStudentId:old?.sourceStudentId || '',
        automatic:!!old?.automatic,
        createdAt:old?.createdAt || now,
        updatedAt:now
      });

      const index = state.incomes.findIndex(x => normalizeIncome(x).id === id);
      if(index >= 0) state.incomes[index] = obj;
      else state.incomes.push(obj);

      document.getElementById('incomeDialog')?.close();
      saveState(false);

      if(session){
        try{
          await cloudUpsertIncome(obj);
          await pullCloud();
          toast('Gelir kaydedildi.');
        }catch(error){
          alert(`Gelir buluta kaydedilemedi: ${error.message}`);
        }
      }else{
        renderAll();
        toast('Gelir bu telefonda kaydedildi.');
      }
    },true);

    form.__bsV2592Submit = true;
  }

  function applyListDescriptions(){
    if(typeof state !== 'object' || !Array.isArray(state?.incomes) || typeof normalizeIncome !== 'function') return;
    const byId = new Map(state.incomes.map(normalizeIncome).map(row => [String(row.id),row]));
    document.querySelectorAll('#incomeList [data-income]').forEach(card => {
      const row = byId.get(String(card.dataset.income || ''));
      if(!row || row.type !== OTHER) return;
      const title = card.querySelector('.main strong');
      if(title) title.textContent = row.description ? `Diğer · ${row.description}` : OTHER;
    });
  }

  function installRenderHook(){
    if(typeof renderIncomes !== 'function' || renderIncomes.__bsV2592Description) return;
    const original = renderIncomes;
    const wrapped = function(...args){
      const result = original.apply(this,args);
      applyListDescriptions();
      return result;
    };
    wrapped.__bsV2592Description = true;
    renderIncomes = wrapped;
  }

  installNormalizer();
  ensureUi();
  installCloudWriter();
  installOpenHook();
  installSubmitGuard();
  installRenderHook();
  applyListDescriptions();
})();
