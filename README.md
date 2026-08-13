# Kurum Finans Asistanı

## V241 hotfix doğrulama

V241, V240 ödeme motorunu değiştirmeden yalnız mevcut ödeme düzenleme modalında iPhone/PWA arka plan kaydırmasını kilitleyen küçük UX hotfix'idir. Teknik kapsam: `v241-payment-modal-scroll-lock.js`, `core-compat.js` yükleyicisi ve `sw.js` önbellek kaydı. Ödeme/taksit hesaplama motoru `payment-editor-v240.js` aynen korunur.

> Not: Bu başlık yalnız V241 test dalı doğrulama kaydıdır. Aşağıdaki mevcut V1 dokümantasyonu korunmuştur.

# BS Ofis Bütçe

## Güncel durum — V1 kabul adayı / UI V237

Bu repo, BS Ofis için mobil öncelikli PWA finans asistanını içerir.

### V1 çalışma kapsamı

- Borç ve ödeme takibi
- Taksit planlama ve düzenleme
- Harcama kaydı
- Manuel gelir kaydı
- BS Ofis `StudentPayments` tahsilatlarının otomatik gelir aktarımı
- Tamamlanan derslere göre gelir sahipliği dağıtımı
- Aynı `PaymentID` için veritabanında bölünmüş gelir satırları
- Kullanıcı arayüzünde aynı `PaymentID` için tek tahsilat kartı
- Supabase ortak bulut
- PWA / iPhone ana ekran kullanımı
- JSON yedekleme

### V1 UX standardı

- Sabit üst bar
- Alt menü 5 sekme: `Özet`, `Borçlar`, `Ödemeler`, `Gelirler`, `Takvim`
- `Harcamalar` alt menüde değildir
- Yatay scroll yok
- Uzun formlarda `Kaydet` erişilebilir kalır
- Modal başlıkları sabit kalır
- Teknik alanlar kullanıcıya gösterilmez

### Ana giriş ve PWA paketi

Ana giriş dosyası ve PWA paketi V237 üzerinde sabitlenmiştir.

- `index.html` → `core-compat.js?v=237`
- `debt-balance.js?v=236`
- `schedule-editor.js?v=232`
- `v230-mobile-dialog.js?v=235`
- `v234-shell-lock.js?v=237`
- `v237-modal-footer.js?v=237`
- manifest başlangıcı `./?v=237`
- `sw.js` V237 önbelleği

### BS Ofis gelir entegrasyonu

Gelirin tek gerçek kaynağı:

- `StudentPayments`

`Lessons` gelir oluşturmaz; yalnız gelir sahibini belirlemek için kullanılır.

Gelir sahibi kuralı:

- `TCH-001` → Süleyman
- `TCH-002` → Başak
- diğer öğretmenler → Kurum Kasası
- hem Başak hem Süleyman ile çalışan öğrenci → otomatik atanmaz, kontrol gerekir

Aynı tahsilat birden fazla gelir sahibine dağıtılabilir. Bu durumda Supabase `gelirler` tablosunda aynı `PaymentID` için birden fazla satır oluşabilir; kullanıcı arayüzünde bunlar tek tahsilat olarak gösterilir.

### V1.7 SQL sırası

Supabase SQL Editor'da:

1. `v1.5_gelirler.sql`
2. `v1.6_supabase_entegrasyon.sql`
3. `v1.7_gelir_dagitim.sql`

### V1.7 Apps Script dosyaları

- `BSOfisFinansAktarim_V17_KuruTest.gs`
- `BSOfisFinansAktarim_V17_EfeGercekTest.gs`
- `BSOfisFinansAktarim_V17_Canli.gs`

Secret/service-role bilgileri GitHub'da tutulmaz.

### V1 sonrası geliştirme kuralı

V1 kabul adayından sonra yeni özellik eklenmez. Yalnız gerçek kullanım sırasında doğrulanan kritik hata ve veri bütünlüğü sorunları düzeltilir.
