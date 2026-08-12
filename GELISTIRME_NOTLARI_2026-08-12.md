# BS OFİS BÜTÇE — 12.08.2026 Geliştirme Notu

## Tamamlananlar

- BS Ofis gelir kaynağı yalnız `StudentPayments` olarak korunuyor.
- V1.7 gelir dağıtımı `Lessons` tablosundaki `Yapıldı` dersler üzerinden çalışıyor.
- `TCH-001` → Süleyman, `TCH-002` → Başak, diğer öğretmenler → Kurum Kasası.
- Supabase aynı PaymentID'nin farklı gelir sahiplerine bölünmesine izin verecek şekilde V1.7'ye geçirildi.
- Efe Bulut 11.08.2026 / 8.000 ₺ testi başarılı: Süleyman 4.000 ₺ + Kurum Kasası 4.000 ₺.
- V1.7 canlı senkron 4 tahsilat / 26.000 ₺ toplam için doğrulandı.
- V1.7 5 dakikalık otomatik tetikleyici kuruldu.
- Gelir ekranında seçili aya ait Başak / Süleyman / Kurum toplam kartları ve hızlı filtre davranışı çalışıyor.
- Aynı BS Ofis PaymentID parçaları kullanıcıya tek tahsilat kartı olarak gösteriliyor; dağılım alt açıklamada yer alıyor.
- BS Ofis otomatik gelir kartları kullanıcı arayüzünde düzenleme/silme diyaloğuna açılmıyor.
- Özet, Borçlar, Ödemeler, Gelirler ve Takvim ekranlarına dokunulabilir KPI/hızlı filtre akışları eklendi.
- Özet ekranına gerçekleşen net nakit, ödeme planı, dikkat gerektirenler ve hızlı işlemler eklendi.
- PWA marka adı `BS OFİS BÜTÇE YÖNETİMİ`, kısa adı `BS Bütçe` olarak sabitlendi.

## UI190 mimari temizliği

- Marka ve görsel tema tek `ui.js` dosyasında birleştirildi.
- Eski üst üste tema zinciri kaldırıldı: `v180-ui.js`, `v181-ui.js`, `v182-ui.js`, `v184-ui.js` artık canlı repoda yok.
- `v178-ui.js` yalnız işlevsel `v179-ui.js` ve tek güncel `ui.js` katmanını yüklüyor.
- `index.html` ilk boyamada doğrudan yeni `bs-budget-mark.svg` logosunu kullanıyor.
- Eski `FİNANS YÖNETİMİ` MutationObserver zorlaması kaldırıldı.
- Üst bardaki gerçek `#appTitle` ve `#orgEyebrow` elemanları korunuyor; bulut senkronunun kullandığı DOM artık tema tarafından silinmiyor.
- Eski `bs-logo.png` ve `icon.svg` marka varlıkları kaldırıldı.
- Service Worker önbelleği yalnız güncel işlevsel modülleri ve `ui.js` katmanını içeriyor.
- Tasarım standardı: açık `#F8FAFC` zemin, beyaz kartlar, ana mavi `#2563EB`; gelir/pozitif teal, kalan/yaklaşan turuncu, gecikme kırmızı.

## Sıradaki kontroller

1. Uygulama tamamen kapatılıp yeniden açıldığında üst barın tek ve temiz marka yapısıyla geldiğini doğrula.
2. Bulut senkronunun başlık/DOM hatası vermediğini doğrula.
3. Telefon ve masaüstünde Özet → Borçlar → Ödemeler → Gelirler → Takvim ekranlarında eski tema kalıntısı olmadığını kontrol et.
4. Yeni BS Ofis tahsilatı geldiğinde V1.7 otomatik aktarımın tek kart + dağılım görünümünü koruduğunu doğrula.

## Sonraki güvenli geliştirmeler

- `app.js` içindeki schemaVersion 16 / merge 15 tutarsızlığını kontrollü düzeltmek.
- Senkron hata mesajındaki eski V1.6 metnini güncel V1.7/V1.7 dağıtım yapısına göre düzeltmek.
- Masaüstü/tablet responsive genişliği ve ekran başına bilgi yoğunluğunu kullanıcı testiyle ince ayarlamak.
- Harcamalar görünür menüye alınacaksa alt menü kapasitesini bozmadan erişim akışını tasarlamak.

## Değiştirilmemesi gerekenler

- StudentPayments tek nakit/gelir kaynağı olmaya devam edecek.
- Lessons ek gelir yaratmayacak; yalnız tahsilatın sahibini/dağılımını belirleyecek.
- Veritabanında dağıtım parçalı, kullanıcı arayüzünde tahsilat tek kayıt olarak kalacak.
- Finans çekirdeği ve doğrulanmış V1.7 dağıtım motoru yalnız kritik hata varsa değiştirilecek.