# Kurum Finans Asistanım

Mobil öncelikli, iki telefonda ortak kullanılabilen kurum borç ve harcama takip PWA'sı.

## Hazır özellikler
- Özet dashboard
- Kurum borçları
- Kurum harcamaları
- Borç ödemeleri ve kalan borcun otomatik düşmesi
- Yaklaşan/geciken ödeme takvimi
- Aylık bütçe ve finans asistanı
- İşlemi yapan telefon/kişi adı
- Yerel kullanım + Supabase ortak bulut modu
- JSON yedekleme
- PWA / ana ekrana kurulum

## Ortak kullanım için yalnız 3 adım
1. Supabase'de boş bir proje oluşturun.
2. `kurulum.sql` dosyasını Supabase SQL Editor'de bir kez çalıştırın.
3. Uygulama > Ayarlar > Ortak Bulut bölümünde Project URL ve publishable/anon key'i girin. İlk telefonda kurum hesabını oluşturun; ikinci telefonda aynı e-posta/şifre ile giriş yapın.

İki cihaz aynı kurum hesabını kullanır; veriler bulutta ortaktır. Her telefonda Ayarlar > Bu Telefon bölümünden farklı “işlemleri yapan kişi” adı tanımlanabilir.

## Netlify
Bu klasörün tamamını Netlify'a deploy edin. `index.html` kökte olmalıdır.

## Güvenlik
Supabase tablolarında Row Level Security (RLS) açıktır. Uygulama yalnız publishable/anon key kullanır; service_role key kesinlikle uygulamaya yazılmamalıdır.
