# BS OFİS BÜTÇE

BS Ofis için mobil öncelikli, ortak bulut verili finans yönetim PWA'sı.

## Güncel durum — V1 kabul adayı / UI V237

Uygulamanın V1 işlev kapsamı tamamlanmıştır. Bundan sonra yeni özellik eklemek yerine yalnız gerçek kullanımda ortaya çıkan hata ve veri bütünlüğü sorunları düzeltilmelidir.

Çalışan ana kapsam:

- Kurum borçları ve borç ödemeleri
- Kısmi ödeme ve taksit ilerletme
- Sabit, kademeli ve kesin tarih/tutar taksit planları
- Taksit planından otomatik kalan borç hesabı
- Kurum harcamaları
- Manuel gelir kayıtları
- BS Ofis `StudentPayments` tahsilatlarının otomatik gelir aktarımı
- Gerçekleşmiş (`Yapıldı`) derslere göre gelir sahipliği dağıtımı
- Başak / Süleyman / Kurum aylık gelir toplamları
- Tek tahsilatın arka planda birden fazla gelir sahibine dağıtılabilmesi
- Kullanıcı ekranında aynı `PaymentID` için tek tahsilat kartı ve dağılım açıklaması
- BS Ofis otomatik gelirlerinin salt-okunur korunması
- Supabase ortak bulut modu
- PWA / iPhone ana ekran kullanımı
- JSON yerel yedekleme
- Sabit üst bar ve sabit 5 sekmeli alt navigasyon
- Mobilde yatay kaymanın engellenmesi
- Detay ve düzenleme modallarında sabit başlık
- Uzun düzenleme formlarında sabit `Kaydet` düğmesi

## V1 kabul adayı sürüm zinciri

Ana giriş dosyası ve PWA paketi V237 üzerinde sabitlenmiştir.

- `index.html` → `core-compat.js?v=237`
- `debt-balance.js?v=236`
- `schedule-editor.js?v=232`
- `v230-mobile-dialog.js?v=235`
- `v234-shell-lock.js?v=237`
- `v237-modal-footer.js?v=237`
- `manifest.webmanifest` → `start_url: ./?v=237`
- `sw.js` → V237 cache paketi

Eski görünüm katmanları yalnız halen çalışan işlevsel bağımlılık oldukları ölçüde korunur. Yeni geliştirmelerde üst üste yeni tema yamaları eklenmemelidir.

## BS Ofis gelir kuralı

Finans uygulamasının nakit/gelir kaynağı yalnız BS Ofis `StudentPayments` kayıtlarıdır. `Lessons` ayrıca gelir üretmez; yalnız tahsilatın hangi gelir sahibine ait olduğunu belirlemek için kullanılır.

Gelir sahipliği, `Lessons` tablosundaki `DersDurumu = Yapıldı` kayıtlarına göre hesaplanır:

- `TCH-001` → Süleyman
- `TCH-002` → Başak
- diğer öğretmenler → Kurum Kasası

Bir öğrenci hem Başak hem Süleyman ile çalışıyorsa otomatik gelir sahibi ataması yapılmaz; kayıt kontrol gerektiren durum olarak ele alınır.

Veritabanında dağıtım parçalı olabilir ancak kullanıcı arayüzünde aynı `PaymentID` tek tahsilat olarak görünür.

## Borç ve taksit planı standardı

- Kısmi ödeme mevcut taksiti azaltır; taksit tamamen kapanmadan vade gereksiz yere ilerlemez.
- Tam ödeme mevcut taksiti kapatır ve sonraki vadeye geçer.
- Fazla ödeme sonraki taksitlere aktarılabilir.
- Kesin plan varsa tarih/tutar satırları genel tahminden önceliklidir.
- Manuel kalan borç girilmemiş ve plan güvenilir ise toplam bakiye plandan otomatik hesaplanır.
- Otomatik hesaplanan bakiye düzenleme formunda yanıltıcı `0` olarak gösterilmez.
- Ödeme sonrası kalan toplam borç negatif olamaz ve sıfırlandığında borç kapanır.

## Mobil kullanıcı deneyimi standardı

- Açık arka plan ve beyaz kartlar
- Ana vurgu `#2563EB`
- Pozitif/gelir için yeşil/teal, yaklaşan/kalan için turuncu, kritik/gecikmiş için kırmızı
- Alt navigasyonda yalnız 5 ana sekme: Özet, Borçlar, Ödemeler, Gelirler, Takvim
- Üst bar ve alt navigasyon ekran hareketinden bağımsız sabittir
- Sayfa içeriği yalnız dikey kayar; yatay kaydırma kapalıdır
- Detay ve düzenleme pencerelerinde başlık sabittir
- Uzun düzenleme formlarında `Kaydet` altta erişilebilir kalır
- Teknik alanlar günlük kullanıcıya gösterilmez

## Supabase migrasyonları

Gelir tarafındaki temel sürüm zinciri:

1. `v1.5_gelirler.sql`
2. `v1.6_supabase_entegrasyon.sql`
3. `v1.7_gelir_dagitim.sql`

`kurulum.sql` eski temel kurulum dosyasıdır; tek başına güncel V1.7 sistemini sıfırdan kurmaz.

## Apps Script V1.7 yedekleri

- `BSOfisFinansAktarim_V17_KuruTest.gs` — yazmadan dağılım hesabı
- `BSOfisFinansAktarim_V17_EfeGercekTest.gs` — kontrollü gerçek kayıt testi
- `BSOfisFinansAktarim_V17_Canli.gs` — canlı senkron ve tetikleyici

Secret/service-role değerleri GitHub'a yazılmaz.

## Güvenlik

Supabase tablolarında RLS kullanılmalıdır. Frontend yalnız publishable/anon key kullanır. `service_role`, Apps Script secret veya özel anahtarlar public GitHub deposuna eklenmez.

## Geliştirme sınırı

V1 kabul adayından sonra:

1. Yeni özellik eklenmez.
2. Finans çekirdeği ve doğrulanmış V1.7 gelir dağıtımı yalnız kritik hata varsa değiştirilir.
3. Gerçek kullanımda çıkan mobil UX veya veri bütünlüğü sorunları kontrollü olarak düzeltilir.
4. Büyük tasarım veya mimari geliştirmeler ayrı sonraki sürüme bırakılır.

Güncel kapanış notu: `GELISTIRME_NOTLARI_2026-08-13.md`.