# BS OFİS BÜTÇE — 12.08.2026 Geliştirme Notu

## Tamamlananlar

- BS Ofis gelir kaynağı yalnız `StudentPayments` olarak korunuyor.
- V1.7 gelir dağıtımı `Lessons` tablosundaki `Yapıldı` dersler üzerinden çalışıyor.
- `TCH-001` → Süleyman, `TCH-002` → Başak, diğer öğretmenler → Kurum Kasası.
- Supabase aynı PaymentID'nin farklı gelir sahiplerine bölünmesine izin verecek şekilde V1.7'ye geçirildi.
- Efe Bulut 11.08.2026 / 8.000 ₺ testi başarılı: Süleyman 4.000 ₺ + Kurum Kasası 4.000 ₺.
- V1.7 canlı senkron 4 tahsilat / 26.000 ₺ toplam için doğrulandı.
- V1.7 5 dakikalık otomatik tetikleyici kuruldu.
- Gelir ekranında seçili aya ait Başak / Süleyman / Kurum küçük toplam kartları eklendi.
- Aynı BS Ofis PaymentID parçaları kullanıcıya tek tahsilat kartı olarak gösteriliyor.
- Tek kart altında gelir dağılımı açıklaması gösteriliyor.
- BS Ofis otomatik gelir kartları kullanıcı arayüzünde düzenleme/silme diyaloğuna açılmıyor; kaynak BS Ofis olarak korunuyor.
- PWA manifest adı `BS OFİS BÜTÇE`, kısa adı `BS Bütçe` olarak güncellendi.
- V1.7 arayüz dosyası PWA önbelleğine eklendi.

## Sabah kontrolü

1. Uygulama kapatılıp yeniden açıldığında Gelirler ekranının aynı görünümü koruduğunu doğrula.
2. 5 dakikalık V1.7 tetikleyicinin yeni bir tahsilatta otomatik çalışmasını ilk fırsatta kontrol et.
3. Yeni bir BS Ofis tahsilatı geldiğinde toplam tahsilatın listede tek kart, dağılımın alt açıklamada görünmesini kontrol et.

## Sonraki güvenli geliştirmeler

- Ana HTML içindeki eski statik `Borç ve Gelir Asistanım / Kurum Finans` metadata metinlerini `BS OFİS BÜTÇE` ile tamamen eşitlemek.
- `app.js` içindeki schemaVersion 16 / merge 15 tutarsızlığını kontrollü düzeltmek.
- Senkron hata mesajındaki V1.6 metnini V1.7'ye güncellemek.
- Çalışan Apps Script V1.7 dosyalarının nihai kopyasını repoda tek bir teknik yedek halinde sabitlemek.
- Arayüzde yalnız gerekirse gelir sahibi küçük kartlarını hızlı filtre düğmesi haline getirmek; kullanıcı kararı gerektirir.

## Değiştirilmemesi gerekenler

- StudentPayments tek nakit/gelir kaynağı olmaya devam edecek.
- Lessons ek gelir yaratmayacak; yalnız tahsilatın sahibini/dağılımını belirleyecek.
- Veritabanında dağıtım parçalı, kullanıcı arayüzünde tahsilat tek kayıt olarak kalacak.
- V1.7 doğrulanmadan eski V1.6 tetikleyici tekrar kurulmayacak.
