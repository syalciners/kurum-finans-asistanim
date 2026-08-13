/* BS OFİS BÜTÇE V2.4.2 - Ödeme düzenleme kayıt durumu ve modal kapanış güvenliği */
(() => {
  if(window.__bsV242PaymentSaveUiLoaded) return;
  window.__bsV242PaymentSaveUiLoaded=true;

  const dialog=document.querySelector('#recordDialog');
  const form=document.querySelector('#recordForm');
  if(!dialog||!form) return;

  function submitButton(){return form.querySelector('button[type="submit"]');}

  function resetSubmitButton(){
    const button=submitButton();
    if(!button) return;
    button.disabled=false;
    button.textContent='Kaydet';
  }

  function currentEdit(){
    const module=form.querySelector('[name="module"]')?.value;
    const id=form.querySelector('[name="id"]')?.value;
    if(!dialog.open||module!=='payments'||!id) return null;
    const target=state.payments.map(normalizePayment).find(p=>p.id===id);
    if(!target) return null;
    const amount=Number(form.querySelector('[name="amount"]')?.value||0);
    const date=String(form.querySelector('[name="date"]')?.value||'');
    return {id,target,amount,date};
  }

  function isSameEffectPaymentEdit(payment){
    const edit=currentEdit();
    if(!edit||payment?.id!==edit.id) return false;
    return Math.abs((+edit.amount||0)-(+edit.target.amount||0))<=0.005
      &&edit.date===String(edit.target.date||'');
  }

  if(typeof openRecordDialog==='function'&&!openRecordDialog.__bsV242SubmitReset){
    const originalOpenRecordDialog=openRecordDialog;
    const wrapped=function(...args){
      resetSubmitButton();
      const result=originalOpenRecordDialog.apply(this,args);
      resetSubmitButton();
      return result;
    };
    wrapped.__bsV242SubmitReset=true;
    openRecordDialog=wrapped;
  }

  if(typeof cloudUpsertPayment==='function'&&!cloudUpsertPayment.__bsV242CloseSameEffectEdit){
    const originalCloudUpsertPayment=cloudUpsertPayment;
    const wrapped=async function(payment,...rest){
      const closeAfterSuccess=isSameEffectPaymentEdit(payment);
      const result=await originalCloudUpsertPayment.call(this,payment,...rest);
      if(closeAfterSuccess){
        resetSubmitButton();
        if(dialog.open) dialog.close();
      }
      return result;
    };
    wrapped.__bsV242CloseSameEffectEdit=true;
    cloudUpsertPayment=wrapped;
  }

  dialog.addEventListener('close',resetSubmitButton);
  dialog.addEventListener('cancel',resetSubmitButton);
  resetSubmitButton();
})();
