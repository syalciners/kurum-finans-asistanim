/**
 * BS Ofis -> BS OFİS BÜTÇE V1.7 CANLI SENKRON
 *
 * StudentPayments tek nakit kaynağıdır.
 * Gelir sahipliği, finansGelirDagitimHesaplaV17_() tarafından
 * Lessons tablosundaki Yapıldı derslere göre dağıtılır.
 *
 * Bu fonksiyon:
 * - Önce V1.7 dağıtım hesabını yapar.
 * - Herhangi bir kontrol gerektiren durum varsa hiçbir kayıt değiştirmez.
 * - Her PaymentID toplamının StudentPayments tutarına eşit olduğunu doğrular.
 * - Mevcut BS Ofis gelir kayıtlarını PaymentID bazında yedekler.
 * - Aynı PaymentID'nin eski kayıtlarını temizler.
 * - Gelir sahibi bazında yeni kayıtları yazar.
 * - Hata halinde ilgili PaymentID'nin eski kayıtlarını geri yükler.
 */
function finansGelirleriniSenkronizeEtV17() {
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    throw new Error('V1.7 finans gelir aktarımı başka bir işlem tarafından çalıştırılıyor.');
  }

  try {
    const ss = finansSpreadsheet_();
    const tahsilatlar = finansSayfayiNesneListesiOlarakOku_(ss, 'StudentPayments');
    const hesap = finansGelirDagitimHesaplaV17_();

    // Güvenlik: dağıtılamayan / sorunlu tek kayıt varsa canlı veriye dokunma.
    if (hesap.kontrolGerekli && hesap.kontrolGerekli.length) {
      Logger.log('V1.7 CANLI SENKRON DURDURULDU - KONTROL GEREKLİ');
      Logger.log(JSON.stringify(hesap.kontrolGerekli, null, 2));
      throw new Error(
        'V1.7 canlı senkron çalıştırılmadı. Kontrol gerekli kayıt sayısı: ' +
        hesap.kontrolGerekli.length
      );
    }

    const tahsilatMap = {};

    tahsilatlar.forEach(r => {
      const paymentId = finansMetin_(r.PaymentID);
      const studentId = finansMetin_(r.StudentID);
      const tarih = finansTarihIso_(r.Tarih);
      const tutar = finansV17Sayi_(r.Tutar);

      if (!paymentId || !studentId || !tarih || !(tutar > 0)) {
        return;
      }

      if (tarih < FINANS_BASLANGIC_TARIHI) {
        return;
      }

      tahsilatMap[paymentId] = {
        paymentId: paymentId,
        studentId: studentId,
        tarih: tarih,
        tutar: finansV17Yuvarla_(tutar),
        createdAt: finansDateTimeIso_(r.CreatedAt) || ''
      };
    });

    const gruplar = {};

    hesap.aktarilacaklar.forEach(r => {
      const paymentId = finansMetin_(r.PaymentID);

      if (!paymentId) {
        return;
      }

      if (!gruplar[paymentId]) {
        gruplar[paymentId] = [];
      }

      gruplar[paymentId].push(r);
    });

    // Her başlangıç-tarihi-sonrası tahsilat tam dağıtılmış olmalı.
    const eksikPaymentIds = Object.keys(tahsilatMap)
      .filter(paymentId => !gruplar[paymentId] || !gruplar[paymentId].length);

    if (eksikPaymentIds.length) {
      throw new Error(
        'V1.7 dağıtımında karşılığı bulunmayan tahsilatlar var: ' +
        eksikPaymentIds.join(', ')
      );
    }

    Object.keys(gruplar).forEach(paymentId => {
      const tahsilat = tahsilatMap[paymentId];

      if (!tahsilat) {
        throw new Error('StudentPayments kaydı bulunamadı: ' + paymentId);
      }

      const dagitilanToplam = finansV17Yuvarla_(
        gruplar[paymentId].reduce(
          (toplam, r) => toplam + finansV17Sayi_(r.Tutar),
          0
        )
      );

      if (Math.abs(dagitilanToplam - tahsilat.tutar) > 0.005) {
        throw new Error(
          'Tahsilat toplamı ile dağıtım eşit değil. PaymentID=' + paymentId +
          ', Tahsilat=' + tahsilat.tutar +
          ', Dağıtım=' + dagitilanToplam
        );
      }
    });

    const userId = finansKullaniciIdiniBul_();
    const ozet = {
      baslangicTarihi: FINANS_BASLANGIC_TARIHI,
      tahsilatSayisi: 0,
      gelirSatiriSayisi: 0,
      toplamTahsilat: 0,
      toplamDagitilan: 0,
      basariliPaymentIds: []
    };

    const paymentIds = Object.keys(gruplar).sort((a, b) => {
      const ta = tahsilatMap[a];
      const tb = tahsilatMap[b];
      const tarih = ta.tarih.localeCompare(tb.tarih);
      return tarih !== 0 ? tarih : a.localeCompare(b);
    });

    paymentIds.forEach(paymentId => {
      const tahsilat = tahsilatMap[paymentId];
      const parcalar = gruplar[paymentId];
      const eskiKayitlar = finansV17PaymentGelirleriniGetir_(userId, paymentId);
      const simdi = new Date().toISOString();

      const yeniKayitlar = parcalar.map(parca => ({
        id: finansDeterministikUuid_(
          'V17:' + paymentId + ':' + parca.GelirSahibi
        ),
        user_id: userId,
        gelir_sahibi: parca.GelirSahibi,
        gelir_turu: 'Özel Ders',
        ogrenci_adi: parca.Ogrenci,
        gelir_tarihi: tahsilat.tarih,
        tutar: finansV17Yuvarla_(finansV17Sayi_(parca.Tutar)),
        ekleyen: 'BS Ofis',
        kaynak: FINANS_KAYNAK,
        kaynak_kayit_id: paymentId,
        kaynak_ogrenci_id: tahsilat.studentId,
        otomatik_aktarim: true,
        olusturma_zamani: tahsilat.createdAt || simdi,
        guncelleme_zamani: simdi
      }));

      try {
        finansV17PaymentGelirleriniSil_(userId, paymentId);

        yeniKayitlar.forEach(kayit => {
          finansSupabaseGelirUpsert_(kayit);
        });

        const sonKayitlar = finansV17PaymentGelirleriniGetir_(userId, paymentId);
        const sonToplam = finansV17Yuvarla_(
          sonKayitlar.reduce(
            (toplam, r) => toplam + finansV17Sayi_(r.tutar),
            0
          )
        );

        if (sonKayitlar.length !== yeniKayitlar.length) {
          throw new Error(
            'Supabase satır sayısı doğrulanamadı. PaymentID=' + paymentId +
            ', Beklenen=' + yeniKayitlar.length +
            ', Bulunan=' + sonKayitlar.length
          );
        }

        if (Math.abs(sonToplam - tahsilat.tutar) > 0.005) {
          throw new Error(
            'Supabase toplamı doğrulanamadı. PaymentID=' + paymentId +
            ', Beklenen=' + tahsilat.tutar +
            ', Bulunan=' + sonToplam
          );
        }

        ozet.tahsilatSayisi++;
        ozet.gelirSatiriSayisi += yeniKayitlar.length;
        ozet.toplamTahsilat = finansV17Yuvarla_(ozet.toplamTahsilat + tahsilat.tutar);
        ozet.toplamDagitilan = finansV17Yuvarla_(ozet.toplamDagitilan + sonToplam);
        ozet.basariliPaymentIds.push(paymentId);

      } catch (hata) {
        Logger.log('PaymentID geri alınıyor: ' + paymentId);

        try {
          finansV17PaymentGelirleriniSil_(userId, paymentId);
          eskiKayitlar.forEach(kayit => finansSupabaseGelirUpsert_(kayit));
          Logger.log('Eski kayıtlar geri yüklendi: ' + paymentId);
        } catch (geriAlmaHatasi) {
          Logger.log(
            'KRİTİK GERİ ALMA HATASI PaymentID=' + paymentId + ': ' +
            geriAlmaHatasi.message
          );
        }

        throw hata;
      }
    });

    Logger.log('===== V1.7 CANLI GELİR SENKRON BAŞARILI =====');
    Logger.log(JSON.stringify(ozet, null, 2));

    return ozet;

  } finally {
    lock.releaseLock();
  }
}

/**
 * V1.7 doğrulandıktan sonra kullanılacak 5 dakikalık tetikleyici kurucusu.
 * ŞİMDİ ÇALIŞTIRILMAYACAK; önce canlı senkron elle doğrulanacak.
 */
function finansGelirAktarimTetikleyicisiniKurV17() {
  ScriptApp.getProjectTriggers()
    .filter(t =>
      t.getHandlerFunction() === 'finansGelirleriniSenkronizeEt' ||
      t.getHandlerFunction() === 'finansGelirleriniSenkronizeEtV17'
    )
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('finansGelirleriniSenkronizeEtV17')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('V1.7 finans gelir aktarımı için 5 dakikalık tetikleyici kuruldu.');
}
