function finansV17EfeGercekTest() {
  const TEST_PAYMENT_ID = 'c7a57689';

  const ss = finansSpreadsheet_();

  const tahsilatlar =
    finansSayfayiNesneListesiOlarakOku_(
      ss,
      'StudentPayments'
    );

  const tahsilat = tahsilatlar.find(
    r => finansMetin_(r.PaymentID) === TEST_PAYMENT_ID
  );

  if (!tahsilat) {
    throw new Error(
      'Test tahsilatı bulunamadı: ' + TEST_PAYMENT_ID
    );
  }

  const studentId = finansMetin_(tahsilat.StudentID);
  const tarih = finansTarihIso_(tahsilat.Tarih);
  const beklenenToplam = finansV17Sayi_(tahsilat.Tutar);

  if (!(beklenenToplam > 0)) {
    throw new Error('Test tahsilat tutarı geçersiz.');
  }

  const hesap = finansGelirDagitimHesaplaV17_();

  const parcalar = hesap.aktarilacaklar.filter(
    r => r.PaymentID === TEST_PAYMENT_ID
  );

  if (!parcalar.length) {
    throw new Error(
      'V1.7 hesaplamasında test tahsilatı için dağıtım bulunamadı.'
    );
  }

  const dagitilanToplam = finansV17Yuvarla_(
    parcalar.reduce(
      (toplam, r) => toplam + finansV17Sayi_(r.Tutar),
      0
    )
  );

  if (Math.abs(dagitilanToplam - beklenenToplam) > 0.005) {
    throw new Error(
      'Dağıtım toplamı tahsilata eşit değil. Tahsilat: ' +
      beklenenToplam +
      ', dağıtım: ' +
      dagitilanToplam
    );
  }

  const suleyman = parcalar.find(
    r => r.GelirSahibi === 'Süleyman'
  );

  const kurum = parcalar.find(
    r => r.GelirSahibi === 'Kurum Kasası'
  );

  if (
    !suleyman ||
    !kurum ||
    Math.abs(finansV17Sayi_(suleyman.Tutar) - 4000) > 0.005 ||
    Math.abs(finansV17Sayi_(kurum.Tutar) - 4000) > 0.005
  ) {
    throw new Error(
      'Efe test dağılımı beklenen 4.000 Süleyman + 4.000 Kurum sonucu değil.'
    );
  }

  const ogrenciler =
    finansSayfayiNesneListesiOlarakOku_(
      ss,
      'Students'
    );

  const ogrenci = ogrenciler.find(
    r => finansMetin_(r.StudentID) === studentId
  );

  if (!ogrenci) {
    throw new Error('Öğrenci bulunamadı: ' + studentId);
  }

  const userId = finansKullaniciIdiniBul_();

  const mevcutKayitlar =
    finansV17PaymentGelirleriniGetir_(
      userId,
      TEST_PAYMENT_ID
    );

  Logger.log('===== V1.7 EFE GERÇEK TEST ÖNCESİ =====');
  Logger.log('MEVCUT KAYITLAR:');
  Logger.log(JSON.stringify(mevcutKayitlar, null, 2));
  Logger.log('YENİ DAĞILIM:');
  Logger.log(JSON.stringify(parcalar, null, 2));

  const simdi = new Date().toISOString();

  const yeniKayitlar = parcalar.map(parca => ({
    id: finansDeterministikUuid_(
      'V17:' + TEST_PAYMENT_ID + ':' + parca.GelirSahibi
    ),
    user_id: userId,
    gelir_sahibi: parca.GelirSahibi,
    gelir_turu: 'Özel Ders',
    ogrenci_adi: finansMetin_(ogrenci.AdSoyad),
    gelir_tarihi: tarih,
    tutar: finansV17Sayi_(parca.Tutar),
    ekleyen: 'BS Ofis',
    kaynak: FINANS_KAYNAK,
    kaynak_kayit_id: TEST_PAYMENT_ID,
    kaynak_ogrenci_id: studentId,
    otomatik_aktarim: true,
    olusturma_zamani:
      finansDateTimeIso_(tahsilat.CreatedAt) || simdi,
    guncelleme_zamani: simdi
  }));

  try {
    finansV17PaymentGelirleriniSil_(
      userId,
      TEST_PAYMENT_ID
    );

    yeniKayitlar.forEach(
      kayit => finansSupabaseGelirUpsert_(kayit)
    );

    const sonKayitlar =
      finansV17PaymentGelirleriniGetir_(
        userId,
        TEST_PAYMENT_ID
      );

    finansV17EfeSonucunuDogrula_(
      sonKayitlar,
      beklenenToplam
    );

    Logger.log('===== V1.7 EFE GERÇEK TEST BAŞARILI =====');
    Logger.log(JSON.stringify(sonKayitlar, null, 2));

    return {
      basarili: true,
      PaymentID: TEST_PAYMENT_ID,
      Ogrenci: finansMetin_(ogrenci.AdSoyad),
      TahsilatToplami: beklenenToplam,
      Kayitlar: sonKayitlar
    };

  } catch (hata) {
    Logger.log('V1.7 EFE TEST HATASI: ' + hata.message);
    Logger.log('Eski kayıtlar geri yüklenmeye çalışılıyor...');

    try {
      finansV17PaymentGelirleriniSil_(
        userId,
        TEST_PAYMENT_ID
      );

      mevcutKayitlar.forEach(
        kayit => finansSupabaseGelirUpsert_(kayit)
      );

      Logger.log('Eski kayıtlar geri yüklendi.');

    } catch (geriAlmaHatasi) {
      Logger.log(
        'KRİTİK: Eski kayıtlar geri yüklenemedi: ' +
        geriAlmaHatasi.message
      );
    }

    throw hata;
  }
}


function finansV17PaymentGelirleriniGetir_(
  userId,
  paymentId
) {
  const select = [
    'id',
    'user_id',
    'gelir_sahibi',
    'gelir_turu',
    'ogrenci_adi',
    'gelir_tarihi',
    'tutar',
    'ekleyen',
    'kaynak',
    'kaynak_kayit_id',
    'kaynak_ogrenci_id',
    'otomatik_aktarim',
    'olusturma_zamani',
    'guncelleme_zamani'
  ].join(',');

  const path =
    '/rest/v1/gelirler' +
    '?select=' + select +
    '&user_id=eq.' + encodeURIComponent(userId) +
    '&kaynak=eq.' + encodeURIComponent(FINANS_KAYNAK) +
    '&kaynak_kayit_id=eq.' + encodeURIComponent(paymentId) +
    '&order=gelir_sahibi.asc';

  const rows = finansSupabaseGet_(path);

  return Array.isArray(rows) ? rows : [];
}


function finansV17PaymentGelirleriniSil_(
  userId,
  paymentId
) {
  const key = finansSupabaseServiceKey_();

  const url =
    finansSupabaseUrl_() +
    '/rest/v1/gelirler' +
    '?user_id=eq.' + encodeURIComponent(userId) +
    '&kaynak=eq.' + encodeURIComponent(FINANS_KAYNAK) +
    '&kaynak_kayit_id=eq.' + encodeURIComponent(paymentId);

  const res = UrlFetchApp.fetch(
    url,
    {
      method: 'delete',
      muteHttpExceptions: true,
      headers: {
        ...finansSupabaseHeaders_(key),
        Prefer: 'return=minimal'
      }
    }
  );

  const code = res.getResponseCode();

  if (code < 200 || code >= 300) {
    throw new Error(
      'Supabase eski gelir kayıtlarını silme başarısız. HTTP ' +
      code +
      ': ' +
      res.getContentText()
    );
  }
}


function finansV17EfeSonucunuDogrula_(
  kayitlar,
  beklenenToplam
) {
  if (!Array.isArray(kayitlar) || kayitlar.length !== 2) {
    throw new Error(
      'Efe için Supabase üzerinde tam 2 dağıtım kaydı bekleniyordu.'
    );
  }

  const toplam = finansV17Yuvarla_(
    kayitlar.reduce(
      (s, r) => s + finansV17Sayi_(r.tutar),
      0
    )
  );

  if (Math.abs(toplam - beklenenToplam) > 0.005) {
    throw new Error(
      'Supabase doğrulamasında toplam tutar yanlış. Beklenen: ' +
      beklenenToplam +
      ', bulunan: ' +
      toplam
    );
  }

  const suleyman = kayitlar.find(
    r => r.gelir_sahibi === 'Süleyman'
  );

  const kurum = kayitlar.find(
    r => r.gelir_sahibi === 'Kurum Kasası'
  );

  if (
    !suleyman ||
    !kurum ||
    Math.abs(finansV17Sayi_(suleyman.tutar) - 4000) > 0.005 ||
    Math.abs(finansV17Sayi_(kurum.tutar) - 4000) > 0.005
  ) {
    throw new Error(
      'Supabase doğrulaması 4.000 Süleyman + 4.000 Kurum sonucu vermedi.'
    );
  }
}
