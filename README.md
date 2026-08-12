# BS OFİS BÜTÇE

BS Ofis için mobil öncelikli, ortak bulut verili finans yönetim PWA'sı.

## Güncel durum — V1.7 çekirdek / UI190

- Kurum borçları ve borç ödemeleri
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

## BS Ofis gelir kuralı

Finans uygulamasının nakit/gelir kaynağı yalnız BS Ofis `StudentPayments` kayıtlarıdır. `Lessons` ayrıca gelir üretmez; yalnız tahsilatın hangi gelir sahibine ait olduğunu belirlemek için kullanılır.

Gelir sahipliği, `Lessons` tablosundaki `DersDurumu = Yapıldı` kayıtlarına göre hesaplanır:

- `TCH-001` → Süleyman
- `TCH-002` → Başak
- diğer öğretmenler → Kurum Kasası

Örnek: Efe Bulut 8.000 ₺ tahsilat → Süleyman 4.000 ₺ + Kurum Kasası 4.000 ₺. Kullanıcı ekranında tahsilat tek 8.000 ₺ kart olarak görünür.

## Frontend mimarisi

Görsel mimari 12.08.2026 tarihinde sadeleştirilmiştir. Marka ve tema artık üst üste sürüm dosyalarıyla değil, tek bir güncel katmanla yönetilir.

Çalışan zincir:

1. `app.js` — temel veri, form, bulut ve kayıt işlevleri
2. `v17-ui.js` — V1.7 gelir görünümü ve BS Ofis tahsilat gruplanması
3. `v176-ui.js` → `v177-ui.js` → `v178-ui.js` → `v179-ui.js` — doğrulanmış işlevsel UX modülleri
4. `ui.js` — **tek güncel marka, renk, responsive ve görsel tema katmanı**

Eski `v180-ui.js`, `v181-ui.js`, `v182-ui.js` ve `v184-ui.js` tema dosyaları kaldırılmıştır. Yeniden bağlanmamalıdır. Üst bardaki `#appTitle` ve `#orgEyebrow` DOM elemanları bulut/sistem uyumluluğu için korunur; görsel tema bu elemanları silmemelidir.

Güncel tasarım standardı: açık `#F8FAFC` zemin, beyaz kartlar, ana eylem/aktif durumda `#2563EB`, pozitif/gelir vurgusunda teal, yaklaşan/kalan ödemede turuncu ve gecikmede kırmızı. Marka ikonu `bs-budget-mark.svg`, yatay marka dosyası `bs-budget-logo.svg`.

## Supabase migrasyonları

Mevcut çalışan sistemin gelir tarafındaki sürüm zinciri:

1. `v1.5_gelirler.sql` — `gelirler` tablosunu oluşturur.
2. `v1.6_supabase_entegrasyon.sql` — BS Ofis kaynak alanlarını ve Kurum Kasası desteğini ekler.
3. `v1.7_gelir_dagitim.sql` — aynı `PaymentID`'nin farklı gelir sahiplerine bölünebilmesini sağlar.

> **Önemli:** `kurulum.sql` eski temel kurulum dosyasıdır. Tek başına güncel V1.7 sistemini sıfırdan kurmaz; `gelirler` ve `uygulama_ayarlari` yapısının tamamını içermez. Yeni bir Supabase projesinde yalnız `kurulum.sql` çalıştırılarak V1.7 kurulmuş kabul edilmemelidir.

## Apps Script V1.7 yedekleri

- `BSOfisFinansAktarim_V17_KuruTest.gs` — hiçbir veri yazmadan gelir dağılımını hesaplar.
- `BSOfisFinansAktarim_V17_EfeGercekTest.gs` — Efe Bulut tahsilatıyla kontrollü gerçek kayıt testidir.
- `BSOfisFinansAktarim_V17_Canli.gs` — doğrulanmış canlı senkron ve 5 dakikalık tetikleyici fonksiyonlarıdır.

Canlı Apps Script projesinde temel V1.6 yardımcı fonksiyonları ile bu V1.7 dosyaları birlikte çalışır. Secret/service-role değerleri GitHub'a yazılmaz.

## Güvenlik

Supabase tablolarında RLS kullanılmalıdır. Frontend yalnız publishable/anon key kullanır. `service_role` veya Apps Script secret değerleri hiçbir zaman frontend'e veya public GitHub deposuna eklenmemelidir.

## Teknik not

Güncel geliştirme ve test durumu `GELISTIRME_NOTLARI_2026-08-12.md` dosyasında tutulur.