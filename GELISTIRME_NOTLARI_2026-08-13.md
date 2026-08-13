# BS OFİS BÜTÇE — 13.08.2026 Kapanış / Devir Notu

## Durum

**V1 kabul adayı: V237**

Finans Asistanı'nın V1 işlev kapsamı tamamlanmıştır. Yeni özellik geliştirmesi bu noktada durdurulur. Bundan sonra yalnız gerçek kullanımda ortaya çıkan kritik hata, veri bütünlüğü veya mobil kullanılabilirlik sorunu varsa müdahale edilir.

## Sabitlenen kullanıcı deneyimi

- Üst BS Ofis Bütçe barı sabittir.
- Alt navigasyon sabittir ve yalnız 5 ana sekme içerir: Özet, Borçlar, Ödemeler, Gelirler, Takvim.
- Sayfa başlıkları ana içerikle birlikte kayar.
- Mobil ekran yatay kaymaz; yalnız dikey kaydırma kullanılır.
- Borç detay penceresinde başlık ve kapatma düğmesi sabittir.
- Borç düzenleme penceresinde `Kaydı Düzenle` başlığı ve kapatma düğmesi sabittir.
- Uzun düzenleme formlarında `Kaydet` düğmesi altta erişilebilir kalır.
- Kesin taksit planı düzenleyicisi mobil genişliğe sığar.

## Borç / ödeme motoru

- Kısmi ödeme mevcut taksite işler; taksit tamamlanmadan vade ilerlemez.
- Tam ödeme taksiti kapatıp sıradaki vadeye geçer.
- Fazla ödeme sonraki taksitlere devredebilir.
- Kesin tarih/tutar planı varsa genel plan tahmininden önceliklidir.
- Kesin planlar `custom.installment_schedule` içinde saklanır.
- Manuel bakiye girilmemiş güvenilir planlarda kalan toplam borç otomatik hesaplanır.
- Otomatik bakiye düzenleme formunda `0` olarak gösterilmez; otomatik hesaplama bilgisi verilir.
- Bakiye ödeme sonrası negatif olamaz; sıfıra ulaştığında borç kapanır.

## Gelir entegrasyonu

Finans uygulamasının tek nakit/gelir kaynağı BS Ofis `StudentPayments` kayıtlarıdır.

`Lessons` ek gelir üretmez; yalnız tahsilat gelir sahipliğini belirlemek için kullanılır.

Gelir sahibi kuralı:

- `TCH-001` → Süleyman
- `TCH-002` → Başak
- diğer öğretmenler → Kurum Kasası
- öğrenci hem Başak hem Süleyman ile çalışıyorsa otomatik atama yapılmaz; kontrol gerekir

Aynı `PaymentID` veritabanında birden fazla dağıtım satırına bölünebilir ancak kullanıcı ekranında tek tahsilat kartı olarak görünür.

## PWA / sürüm zinciri

Ana giriş ve cache paketi V237 ile eşitlenmiştir.

- `index.html` → `manifest.webmanifest?v=237`
- `index.html` → `core-compat.js?v=237`
- `debt-balance.js?v=236`
- `schedule-editor.js?v=232`
- `v230-mobile-dialog.js?v=235`
- `v234-shell-lock.js?v=237`
- `v237-modal-footer.js?v=237`
- `manifest.webmanifest` → `start_url: ./?v=237`
- `sw.js` → `bs-ofis-butce-ui237-sticky-save-footer-20260813`

## Tasarım standardı

- Açık zemin
- Beyaz kartlar
- Ana mavi `#2563EB`
- Pozitif / gelir yeşil-teal
- Yaklaşan / kalan turuncu
- Kritik / gecikmiş kırmızı
- İnce sınırlar, düşük gölge
- Tablet/telefon uyumlu kompakt bilgi yoğunluğu
- Teknik alanlar kullanıcıya gösterilmez

## Değiştirilmemesi gerekenler

- `StudentPayments` tek gelir/nakit kaynağı olmaya devam eder.
- `Lessons` ayrıca gelir oluşturmaz.
- V1.7 gelir dağıtım motoru kritik hata dışında değiştirilmez.
- Borç/taksit motoruna yeni davranış kritik ihtiyaç olmadan eklenmez.
- Alt navigasyona Harcamalar eklenmez; ana navigasyon 5 sekme olarak kalır.
- Çalışan mobil dialog davranışlarının üzerine yeni event/MutationObserver yamaları eklenmez.

## Kapanış kontrolü

Kod tarafında V237 sürüm zinciri ve dokümantasyon eşitlenmiştir.

Kullanıcı tarafında son kabul kontrolü yalnız şu akış içindir:

1. Uygulamayı tamamen kapatıp aç.
2. Borç → Detay → Düzenle → Planı Düzenle akışını aç.
3. Başlığın sabit, yatay kaymanın kapalı ve `Kaydet` düğmesinin altta erişilebilir kaldığını doğrula.
4. Aynı borcu kapatıp tekrar açarak ekranın kilitlenmediğini doğrula.

Bu test başarılıysa V237 V1 kabul adayı olarak dondurulur ve ana geliştirme odağı BS Eğitim Yönetimi V258'e geçer.