const KEY='kurumFinansAsistanim.v1';
const CONFIG_KEY='kurumFinansAsistanim.cloud';
const DEVICE_KEY='kurumFinansAsistanim.deviceName';
const APP_CONFIG_KEY='kurumFinansAsistanim.appConfig.v12';

const defaultState={debts:[],expenses:[],payments:[],incomes:[],budget:{orgName:'',income:0,fixedExpenses:0,reserve:0},updatedAt:null};

const defaultAppConfig={
  schemaVersion:16,
  applicationName:'Borç ve Gelir Asistanım',
  menus:[
    {view:'dashboard',label:'Özet',icon:'⌂',visible:true,locked:false},
    {view:'debts',label:'Borçlar',icon:'▤',visible:true,locked:false},
    {view:'payments',label:'Ödemeler',icon:'✓₺',visible:true,locked:false},
    {view:'incomes',label:'Gelirler',icon:'＋₺',visible:true,locked:false},
    {view:'calendar',label:'Takvim',icon:'◷',visible:true,locked:false},
    {view:'expenses',label:'Harcamalar',icon:'₺',visible:false,locked:false},
    {view:'settings',label:'Ayarlar',icon:'⚙',visible:true,locked:true}
  ],
  fields:{
    debts:{builtIns:[
      {id:'name',label:'Borç adı',visible:true,locked:true},
      {id:'type',label:'Tür',visible:true,locked:false},
      {id:'minimum',label:'Aylık / mevcut ödeme',visible:true,locked:false},
      {id:'dueDate',label:'Sıradaki ödeme tarihi',visible:true,locked:false},
      {id:'notes',label:'Not',visible:true,locked:false},
      {id:'original',label:'İlk borç',visible:false,locked:false},
      {id:'balance',label:'Kalan toplam borç',visible:false,locked:false},
      {id:'rate',label:'Faiz oranı',visible:false,locked:false},
      {id:'frequency',label:'Tekrar',visible:false,locked:false}
    ],custom:[
      {id:'debt_owner',label:'Borç sahibi',type:'select',options:['Süleyman','Başak'],required:true,visible:true},
      {id:'remaining_installments',label:'Kalan taksit',type:'number',options:[],required:false,visible:true},
      {id:'next_payment_after_current',label:'Sonraki aylardaki ödeme',type:'number',options:[],required:false,visible:false}
    ]},
    expenses:{builtIns:[
      {id:'date',label:'Tarih',visible:true,locked:true},
      {id:'category',label:'Kategori',visible:true,locked:false},
      {id:'description',label:'Açıklama',visible:true,locked:true},
      {id:'amount',label:'Tutar',visible:true,locked:true},
      {id:'method',label:'Ödeme yöntemi',visible:true,locked:false},
      {id:'notes',label:'Not',visible:true,locked:false}
    ],custom:[]},
    payments:{builtIns:[
      {id:'debtId',label:'Borç',visible:true,locked:true},
      {id:'date',label:'Tarih',visible:true,locked:true},
      {id:'amount',label:'Tutar',visible:true,locked:true},
      {id:'notes',label:'Not',visible:true,locked:false}
    ],custom:[]}
  },
  lists:{
    expenseCategories:['Kira','Personel','Öğretmen / Uzman Ödemesi','Vergi','Elektrik / Su / Doğalgaz','Telefon / İnternet','Malzeme','Yazılım / Abonelik','Ulaşım','Bakım / Onarım','Reklam','Yemek','Diğer'],
    paymentMethods:['Banka','Kredi Kartı','Nakit','Havale / EFT','Diğer'],
    incomeStudents:[]
  }
};

const fieldDefs={
  debts:{
    name:{type:'text',required:true,placeholder:'Örn. İşletme Kredi Kartı'},
    type:{type:'select',options:()=>['Kredi','Kredi Kartı','Kredi Kartı Yapılandırma','Elden Borç','KMH / Ek Hesap','Diğer']},
    original:{type:'number',min:0,step:'0.01'},
    balance:{type:'number',min:0,step:'0.01'},
    rate:{type:'number',min:0,step:'0.01'},
    minimum:{type:'number',min:0,step:'0.01'},
    dueDate:{type:'date'},
    frequency:{type:'select',options:()=>[
      {value:'monthly',label:'Aylık'},
      {value:'oneoff',label:'Tek sefer'}
    ]},
    notes:{type:'textarea'}
  },
  expenses:{
    date:{type:'date',required:true},
    category:{type:'select',options:()=>appConfig.lists.expenseCategories},
    description:{type:'text',required:true,placeholder:'Örn. Ağustos internet faturası'},
    amount:{type:'number',required:true,min:.01,step:'0.01'},
    method:{type:'select',options:()=>appConfig.lists.paymentMethods},
    notes:{type:'textarea'}
  },
  payments:{
    debtId:{
      type:'select',
      required:true,
      options:()=>activeDebts().map(d=>({
        value:d.id,
        label:`${d.name} — ${d.minimum>0?money(d.minimum):'Tutar girilecek'}`
      }))
    },
    date:{type:'date',required:true},
    amount:{type:'number',required:true,min:.01,step:'0.01'},
    notes:{type:'textarea'}
  }
};

let sb=null;
let session=null;
let deferredPrompt=null;
let syncing=false;
let activeView='dashboard';

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function blurActiveFormControl(){
  const el=document.activeElement;
  if(el&&['INPUT','SELECT','TEXTAREA'].includes(el.tagName))el.blur();
}

const money=n=>new Intl.NumberFormat('tr-TR',{
  style:'currency',
  currency:'TRY',
  maximumFractionDigits:0
}).format(Number(n)||0);

const fmt=n=>new Intl.NumberFormat('tr-TR',{
  maximumFractionDigits:2
}).format(Number(n)||0);

const todayISO=()=>{
  const d=new Date();
  const z=d.getTimezoneOffset()*60000;
  return new Date(d-z).toISOString().slice(0,10);
};

const parseDate=s=>s?new Date(`${s}T12:00:00`):null;

const esc=s=>String(s??'').replace(
  /[&<>'"]/g,
  c=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    "'":'&#39;',
    '"':'&quot;'
  }[c])
);

const uid=()=>globalThis.crypto?.randomUUID?.()
  ||Date.now().toString(36)+Math.random().toString(36).slice(2);

const clone=v=>JSON.parse(JSON.stringify(v));

const deviceName=()=>localStorage.getItem(DEVICE_KEY)||'Bu telefon';

let state=loadState();
let appConfig=loadAppConfig();
let cloud=loadCloud();

function mergeAppConfig(raw={}){
  const base=clone(defaultAppConfig);
  const oldSchema=+(raw.schemaVersion||0);

  base.schemaVersion=15;

  if(raw.applicationName){
    base.applicationName=raw.applicationName;
  }

  if(Array.isArray(raw.menus)){
    const byView=new Map(raw.menus.map(x=>[x.view,x]));

    base.menus=base.menus.map(x=>({
      ...x,
      ...(byView.get(x.view)||{}),
      locked:x.view==='settings'
    }));

    const order=raw.menus.map(x=>x.view);

    base.menus.sort((a,b)=>{
      const ia=order.indexOf(a.view);
      const ib=order.indexOf(b.view);
      return (ia<0?999:ia)-(ib<0?999:ib);
    });

    if(!order.includes('incomes')){
      const income=base.menus.find(x=>x.view==='incomes');
      base.menus=base.menus.filter(x=>x.view!=='incomes');

      const di=base.menus.findIndex(x=>x.view==='debts');
      base.menus.splice(di+1,0,income);
    }
  }

  if(oldSchema<14){
    const canonical=[
      'dashboard',
      'debts',
      'payments',
      'incomes',
      'calendar',
      'expenses',
      'settings'
    ];

    const visibleByView={
      dashboard:true,
      debts:true,
      payments:true,
      incomes:true,
      calendar:true,
      expenses:false,
      settings:true
    };

    base.menus.forEach(m=>{
      if(m.view in visibleByView){
        m.visible=visibleByView[m.view];
      }
      m.locked=m.view==='settings';
    });

    base.menus.sort(
      (a,b)=>canonical.indexOf(a.view)-canonical.indexOf(b.view)
    );
  }

  for(const module of ['debts','expenses','payments']){
    const r=raw.fields?.[module];
    if(!r)continue;

    if(Array.isArray(r.builtIns)){
      const map=new Map(r.builtIns.map(x=>[x.id,x]));

      base.fields[module].builtIns=
        base.fields[module].builtIns.map(x=>{
          const incoming=map.get(x.id)||{};

          if(module==='debts'&&oldSchema<13){
            return x;
          }

          return {
            ...x,
            ...incoming,
            locked:x.locked
          };
        });

      if(!(module==='debts'&&oldSchema<13)){
        const order=r.builtIns.map(x=>x.id);

        base.fields[module].builtIns.sort((a,b)=>{
          const ia=order.indexOf(a.id);
          const ib=order.indexOf(b.id);

          return (ia<0?999:ia)-(ib<0?999:ib);
        });
      }
    }

    if(Array.isArray(r.custom)){
      const custom=r.custom.map(x=>({
        id:x.id||uid(),
        label:x.label||'Özel Alan',
        type:x.type||'text',
        options:Array.isArray(x.options)?x.options:[],
        required:!!x.required,
        visible:x.visible!==false
      }));

      if(module==='debts'&&oldSchema<13){
        const known=new Set(custom.map(x=>x.id));

        for(const f of defaultAppConfig.fields.debts.custom){
          if(!known.has(f.id)){
            custom.push(clone(f));
          }
        }
      }

      base.fields[module].custom=custom;
    }
  }

  if(
    Array.isArray(raw.lists?.expenseCategories)
    &&raw.lists.expenseCategories.length
  ){
    base.lists.expenseCategories=raw.lists.expenseCategories;
  }

  if(
    Array.isArray(raw.lists?.paymentMethods)
    &&raw.lists.paymentMethods.length
  ){
    base.lists.paymentMethods=raw.lists.paymentMethods;
  }

  if(Array.isArray(raw.lists?.incomeStudents)){
    base.lists.incomeStudents=[
      ...new Set(
        raw.lists.incomeStudents
          .map(x=>String(x).trim())
          .filter(Boolean)
      )
    ];
  }

  return base;
}

function loadState(){
  try{
    return {
      ...clone(defaultState),
      ...JSON.parse(localStorage.getItem(KEY)||'{}')
    };
  }catch{
    return clone(defaultState);
  }
}

function loadAppConfig(){
  try{
    return mergeAppConfig(
      JSON.parse(localStorage.getItem(APP_CONFIG_KEY)||'{}')
    );
  }catch{
    return clone(defaultAppConfig);
  }
}

function loadCloud(){
  try{
    return JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}');
  }catch{
    return {};
  }
}

function saveState(render=true){
  state.updatedAt=new Date().toISOString();
  localStorage.setItem(KEY,JSON.stringify(state));

  if(render){
    renderAll();
  }
}

function saveAppConfig(render=true){
  localStorage.setItem(APP_CONFIG_KEY,JSON.stringify(appConfig));

  if(render){
    renderAll();
  }
}

function toast(msg){
  const t=$('#toast');
  t.textContent=msg;
  t.classList.add('show');

  setTimeout(
    ()=>t.classList.remove('show'),
    2300
  );
}

function addMonths(date,n=1){
  const d=new Date(date);
  const day=d.getDate();

  d.setDate(1);
  d.setMonth(d.getMonth()+n);

  const last=new Date(
    d.getFullYear(),
    d.getMonth()+1,
    0
  ).getDate();

  d.setDate(Math.min(day,last));

  return d;
}

function normalizeDebt(d){
  return {
    id:d.id||uid(),
    name:d.name||d.ad||'',
    type:d.type||d.tur||'Diğer',
    original:+(d.original??d.ilk_tutar)||0,
    balance:+(d.balance??d.kalan_tutar)||0,
    rate:+(d.rate??d.faiz_orani)||0,
    minimum:+(d.minimum??d.aylik_odeme)||0,
    dueDate:d.dueDate??d.vade_tarihi??'',
    frequency:d.frequency||d.tekrar||'monthly',
    notes:d.notes??d.notlar??'',
    custom:d.custom??d.ozel_alanlar??{},
    status:
      d.status
      ||d.durum
      ||(
        (+(d.balance??d.kalan_tutar)||0)<=0
        ?'closed'
        :'active'
      ),
    addedBy:d.addedBy??d.ekleyen??'',
    createdAt:
      d.createdAt
      ??d.olusturma_zamani
      ??new Date().toISOString(),
    updatedAt:
      d.updatedAt
      ??d.guncelleme_zamani
      ??new Date().toISOString()
  };
}

function normalizeExpense(x){
  return {
    id:x.id||uid(),
    date:x.date||x.tarih||todayISO(),
    category:x.category||x.kategori||'Diğer',
    description:x.description||x.aciklama||'',
    amount:+(x.amount??x.tutar)||0,
    method:x.method||x.odeme_yontemi||'Banka',
    notes:x.notes??x.notlar??'',
    custom:x.custom??x.ozel_alanlar??{},
    addedBy:x.addedBy??x.ekleyen??'',
    createdAt:
      x.createdAt
      ??x.olusturma_zamani
      ??new Date().toISOString(),
    updatedAt:
      x.updatedAt
      ??x.guncelleme_zamani
      ??new Date().toISOString()
  };
}

function normalizePayment(p){
  return {
    id:p.id||uid(),
    debtId:p.debtId||p.borc_id,
    date:p.date||p.tarih||todayISO(),
    amount:+(p.amount??p.tutar)||0,
    notes:p.notes??p.notlar??'',
    custom:p.custom??p.ozel_alanlar??{},
    addedBy:p.addedBy??p.ekleyen??'',
    createdAt:
      p.createdAt
      ??p.olusturma_zamani
      ??new Date().toISOString()
  };
}

function normalizeIncome(i){
  return {
    id:i.id||uid(),
    owner:i.owner||i.gelir_sahibi||'Başak',
    type:i.type||i.gelir_turu||'Maaş',
    student:i.student??i.ogrenci_adi??'',
    date:i.date||i.gelir_tarihi||todayISO(),
    amount:+(i.amount??i.tutar)||0,
    addedBy:i.addedBy??i.ekleyen??'',
    source:i.source??i.kaynak??'',
    sourceRecordId:
      i.sourceRecordId
      ??i.kaynak_kayit_id
      ??'',
    sourceStudentId:
      i.sourceStudentId
      ??i.kaynak_ogrenci_id
      ??'',
    automatic:
      i.automatic
      ??i.otomatik_aktarim
      ??false,
    createdAt:
      i.createdAt
      ??i.olusturma_zamani
      ??new Date().toISOString(),
    updatedAt:
      i.updatedAt
      ??i.guncelleme_zamani
      ??new Date().toISOString()
  };
}

function activeDebts(){
  return state.debts
    .map(normalizeDebt)
    .filter(d=>d.status==='active');
}

function daysBetween(a,b){
  return Math.ceil((b-a)/86400000);
}

function dueItems(){
  const now=parseDate(todayISO());

  return activeDebts()
    .filter(d=>d.dueDate)
    .map(d=>{
      const date=parseDate(d.dueDate);

      return {
        ...d,
        date,
        days:daysBetween(now,date),
        amount:+d.minimum||0
      };
    })
    .sort((a,b)=>a.date-b.date);
}

function monthKey(s=todayISO()){
  return s.slice(0,7);
}

function currentMonthExpenses(){
  const m=monthKey();

  return state.expenses
    .map(normalizeExpense)
    .filter(x=>x.date?.startsWith(m));
}

function currentMonthPayments(){
  const m=monthKey();

  return state.payments
    .map(normalizePayment)
    .filter(x=>x.date?.startsWith(m));
}

function currentMonthIncomes(){
  const m=monthKey();

  return state.incomes
    .map(normalizeIncome)
    .filter(x=>x.date?.startsWith(m));
}

function previousMonthKey(){
  const d=parseDate(`${monthKey()}-01`);
  d.setMonth(d.getMonth()-1);

  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function calcCapacity(){
  return Math.max(
    0,
    (+state.budget.income||0)
    -(+state.budget.fixedExpenses||0)
    -(+state.budget.reserve||0)
  );
}

function empty(text){
  return `<div class="empty">${esc(text)}</div>`;
}

function menuItem(view){
  return appConfig.menus.find(x=>x.view===view);
}

function fieldConfig(module,id){
  return appConfig.fields[module].builtIns.find(x=>x.id===id);
}

function fieldLabel(module,id){
  return fieldConfig(module,id)?.label||id;
}
