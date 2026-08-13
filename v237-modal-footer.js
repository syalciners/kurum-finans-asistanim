/* BS OFİS BÜTÇE V2.3.7 - Sabit modal işlem çubuğu */
(() => {
  if(window.__bsV237ModalFooterLoaded) return;
  window.__bsV237ModalFooterLoaded=true;

  if(document.querySelector('#bsV237ModalFooterStyles')) return;
  const style=document.createElement('style');
  style.id='bsV237ModalFooterStyles';
  style.textContent=`
    /* Uzun düzenleme formlarında Kaydet her zaman erişilebilir kalır. */
    #recordForm > button.primary[type="submit"]{
      position:sticky!important;
      bottom:0!important;
      z-index:125!important;
      width:100%!important;
      min-height:46px!important;
      margin-top:14px!important;
      margin-bottom:0!important;
      border-radius:12px!important;
      box-shadow:0 -10px 22px -16px rgba(15,23,42,.45),0 8px 18px -12px rgba(37,99,235,.45)!important;
    }

    #recordForm > button.primary[type="submit"]::before{
      content:"";
      position:absolute;
      left:-2px;
      right:-2px;
      top:-12px;
      height:12px;
      pointer-events:none;
      background:linear-gradient(to bottom,rgba(255,255,255,0),#fff);
    }

    @media(max-width:520px){
      #recordForm > button.primary[type="submit"]{
        min-height:48px!important;
        font-size:15px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
