/**
 * V1.7 KURU TEST
 * Hiçbir veriyi değiştirmez.
 *
 * StudentPayments tahsilatlarını, aynı öğrencinin "Yapıldı" durumundaki
 * Lessons kayıtlarındaki öğrenci ücretlerine göre gelir sahiplerine dağıtır.
 *
 * Gelir sahibi:
 * - BAŞAK ATİLLA dersi -> Başak
 * - SÜLEYMAN YALÇINER dersi -> Süleyman
 * - Diğer öğretmenlerin dersi -> Kurum Kasası
 *
 * Eşleştirme:
 * - Tahsilat tarihinde yapılan dersler önceliklidir.
 * - Sonra daha eski açık ders ücretleri,
 * - Sonra varsa peşin ödemeyi karşılayacak daha sonraki "Yapıldı" dersler.
 *
 * 10.08.2026 öncesi tahsilatlar da geçmiş bakiyeyi doğru tüketmek için
 * hesaplamaya katılır; fakat aktarılacak gelir listesinde gösterilmez.
 */
function finansGelirDagitimKuruCalismaV17() {

  const sonuc = finansGelirDagitimHesaplaV17_();

  Logger.log('===== V1.7 GELİR DAĞITIM KURU ÇALIŞMA =====');

  Logger.log(
    'AKTARILACAK GELİR SATIRI: ' +
    sonuc.aktarilacaklar.length
  );

  Logger.log(
    JSON.stringify(
      sonuc.aktarilacaklar,
      null,
      2
    )
  );

  Logger.log(
    'KONTROL GEREKLİ: ' +
    sonuc.kontrolGerekli.length
  );

  Logger.log(
    JSON.stringify(
      sonuc.kontrolGerekli,
      null,
      2
    )
  );

  Logger.log(
    'ÖZET: ' +
    JSON.stringify(
      sonuc.ozet,
      null,
      2
    )
  );

  Logger.log(
    'V1.7 KURU ÇALIŞMA TAMAMLANDI - HİÇBİR VERİ YAZILMADI'
  );

  return sonuc;
}


function finansGelirDagitimHesaplaV17_() {

  const ss = finansSpreadsheet_();

  const ogrenciler =
    finansSayfayiNesneListesiOlarakOku_(ss, 'Students');

  const ogretmenler =
    finansSayfayiNesneListesiOlarakOku_(ss, 'Teachers');

  const dersler =
    finansSayfayiNesneListesiOlarakOku_(ss, 'Lessons');

  const tahsilatlar =
    finansSayfayiNesneListesiOlarakOku_(ss, 'StudentPayments');


  const ogrenciAdiMap = {};

  ogrenciler.forEach(r => {

    const studentId =
      finansMetin_(r.StudentID);

    if (studentId) {
      ogrenciAdiMap[studentId] =
        finansMetin_(r.AdSoyad);
    }

  });


  const suleymanId =
    finansOgretmenIdBul_(
      ogretmenler,
      'SÜLEYMAN',
      'YALÇINER'
    ) || 'TCH-001';

  const basakId =
    finansOgretmenIdBul_(
      ogretmenler,
      'BAŞAK',
      'ATİLLA'
    ) || 'TCH-002';


  const kontrolGerekli = [];

  const dersHavuzu = {};


  dersler.forEach(r => {

    const durum =
      finansMetin_(r.DersDurumu)
        .toLocaleLowerCase('tr-TR');

    if (durum !== 'yapıldı') {
      return;
    }


    const studentId =
      finansMetin_(r.StudentID);

    const teacherId =
      finansMetin_(r.TeacherID);

    const lessonId =
      finansMetin_(r.LessonID);

    const tarih =
      finansTarihIso_(r.Tarih);


    if (
      !studentId ||
      !teacherId ||
      !lessonId ||
      !tarih
    ) {

      kontrolGerekli.push({
        Tur: 'Ders',
        LessonID: lessonId,
        StudentID: studentId,
        Tarih: tarih,
        Neden:
          'Yapıldı dersinde StudentID / TeacherID / LessonID / Tarih eksik'
      });

      return;
    }


    let tutar =
      finansV17Sayi_(
        r.OgrenciToplamTutar
      );


    if (!(tutar > 0)) {

      tutar =
        finansV17Sayi_(
          r.DersSayisiSaat
        ) *
        finansV17Sayi_(
          r.OgrenciBirimUcreti
        );

    }


    if (!(tutar > 0)) {

      kontrolGerekli.push({
        Tur: 'Ders',
        LessonID: lessonId,
        Ogrenci:
          ogrenciAdiMap[studentId] ||
          studentId,
        Tarih: tarih,
        Neden:
          'Yapıldı dersinde öğrenci toplam tutarı hesaplanamadı'
      });

      return;
    }


    const gelirSahibi =
      teacherId === basakId
        ? 'Başak'
        : teacherId === suleymanId
          ? 'Süleyman'
          : 'Kurum Kasası';


    if (!dersHavuzu[studentId]) {
      dersHavuzu[studentId] = [];
    }


    dersHavuzu[studentId].push({

      lessonId: lessonId,

      tarih: tarih,

      baslangicSaati:
        finansMetin_(
          r.BaslangicSaati
        ),

      teacherId: teacherId,

      gelirSahibi: gelirSahibi,

      toplamTutar:
        finansV17Yuvarla_(tutar),

      kalanTutar:
        finansV17Yuvarla_(tutar),

      createdAt:
        finansDateTimeIso_(
          r.CreatedAt
        ) || ''

    });

  });


  Object.keys(dersHavuzu)
    .forEach(studentId => {

      dersHavuzu[studentId]
        .sort(finansV17DersSirala_);

    });


  const tahsilatMap = {};


  tahsilatlar.forEach(r => {

    const paymentId =
      finansMetin_(r.PaymentID);

    const studentId =
      finansMetin_(r.StudentID);

    const tarih =
      finansTarihIso_(r.Tarih);

    const tutar =
      finansV17Sayi_(r.Tutar);


    if (
      !paymentId ||
      !studentId ||
      !tarih ||
      !(tutar > 0)
    ) {
      return;
    }


    if (!tahsilatMap[studentId]) {
      tahsilatMap[studentId] = [];
    }


    tahsilatMap[studentId].push({

      paymentId: paymentId,

      studentId: studentId,

      tarih: tarih,

      tutar:
        finansV17Yuvarla_(tutar),

      createdAt:
        finansDateTimeIso_(
          r.CreatedAt
        ) || ''

    });

  });


  Object.keys(tahsilatMap)
    .forEach(studentId => {

      tahsilatMap[studentId]
        .sort(finansV17TahsilatSirala_);

    });


  const aktarilacaklar = [];

  let toplamTahsilat = 0;
  let toplamDagitilan = 0;
  let toplamBekleyen = 0;


  Object.keys(tahsilatMap)
    .sort()
    .forEach(studentId => {

      const havuz =
        dersHavuzu[studentId] || [];

      const ogrenciAdi =
        ogrenciAdiMap[studentId] ||
        'ÖĞRENCİ ADI BULUNAMADI';


      tahsilatMap[studentId]
        .forEach(tahsilat => {

          let kalanTahsilat =
            tahsilat.tutar;


          const ayniGun =
            havuz.filter(d =>
              d.kalanTutar > 0.005 &&
              d.tarih === tahsilat.tarih
            );


          const onceki =
            havuz.filter(d =>
              d.kalanTutar > 0.005 &&
              d.tarih < tahsilat.tarih
            );


          const sonraki =
            havuz.filter(d =>
              d.kalanTutar > 0.005 &&
              d.tarih > tahsilat.tarih
            );


          const adayDersler = [
            ...ayniGun,
            ...onceki,
            ...sonraki
          ];


          const sahipGruplari = {};


          adayDersler.forEach(ders => {

            if (kalanTahsilat <= 0.005) {
              return;
            }


            if (ders.kalanTutar <= 0.005) {
              return;
            }


            const dagitilan =
              finansV17Yuvarla_(
                Math.min(
                  kalanTahsilat,
                  ders.kalanTutar
                )
              );


            if (!(dagitilan > 0)) {
              return;
            }


            ders.kalanTutar =
              finansV17Yuvarla_(
                ders.kalanTutar -
                dagitilan
              );


            kalanTahsilat =
              finansV17Yuvarla_(
                kalanTahsilat -
                dagitilan
              );


            if (!sahipGruplari[ders.gelirSahibi]) {

              sahipGruplari[ders.gelirSahibi] = {
                tutar: 0,
                dersler: []
              };

            }


            sahipGruplari[
              ders.gelirSahibi
            ].tutar =
              finansV17Yuvarla_(
                sahipGruplari[
                  ders.gelirSahibi
                ].tutar +
                dagitilan
              );


            sahipGruplari[
              ders.gelirSahibi
            ].dersler.push({

              LessonID:
                ders.lessonId,

              Tarih:
                ders.tarih,

              Tutar:
                dagitilan

            });

          });


          if (
            tahsilat.tarih >=
            FINANS_BASLANGIC_TARIHI
          ) {

            toplamTahsilat =
              finansV17Yuvarla_(
                toplamTahsilat +
                tahsilat.tutar
              );


            Object.keys(sahipGruplari)
              .forEach(gelirSahibi => {

                const grup =
                  sahipGruplari[
                    gelirSahibi
                  ];


                toplamDagitilan =
                  finansV17Yuvarla_(
                    toplamDagitilan +
                    grup.tutar
                  );


                aktarilacaklar.push({

                  PaymentID:
                    tahsilat.paymentId,

                  Tarih:
                    tahsilat.tarih,

                  Ogrenci:
                    ogrenciAdi,

                  GelirSahibi:
                    gelirSahibi,

                  GelirTuru:
                    'Özel Ders',

                  Tutar:
                    grup.tutar,

                  Dersler:
                    grup.dersler

                });

              });


            if (kalanTahsilat > 0.005) {

              toplamBekleyen =
                finansV17Yuvarla_(
                  toplamBekleyen +
                  kalanTahsilat
                );


              kontrolGerekli.push({

                Tur: 'Tahsilat',

                PaymentID:
                  tahsilat.paymentId,

                Tarih:
                  tahsilat.tarih,

                Ogrenci:
                  ogrenciAdi,

                TahsilatTutari:
                  tahsilat.tutar,

                DagitilamayanTutar:
                  kalanTahsilat,

                Neden:
                  'Tahsilatın tamamına karşılık yeterli Yapıldı ders ücreti bulunamadı'

              });

            }

          }

        });

    });


  return {

    aktarilacaklar: aktarilacaklar,

    kontrolGerekli: kontrolGerekli,

    ozet: {
      baslangicTarihi:
        FINANS_BASLANGIC_TARIHI,

      toplamTahsilat:
        finansV17Yuvarla_(
          toplamTahsilat
        ),

      toplamDagitilan:
        finansV17Yuvarla_(
          toplamDagitilan
        ),

      toplamBekleyen:
        finansV17Yuvarla_(
          toplamBekleyen
        ),

      gelirSatiriSayisi:
        aktarilacaklar.length
    }

  };
}


function finansV17DersSirala_(a, b) {

  const tarih =
    a.tarih.localeCompare(
      b.tarih
    );

  if (tarih !== 0) {
    return tarih;
  }


  const saat =
    a.baslangicSaati.localeCompare(
      b.baslangicSaati
    );

  if (saat !== 0) {
    return saat;
  }


  const olusturma =
    a.createdAt.localeCompare(
      b.createdAt
    );

  if (olusturma !== 0) {
    return olusturma;
  }


  return a.lessonId.localeCompare(
    b.lessonId
  );
}


function finansV17TahsilatSirala_(a, b) {

  const tarih =
    a.tarih.localeCompare(
      b.tarih
    );

  if (tarih !== 0) {
    return tarih;
  }


  const olusturma =
    a.createdAt.localeCompare(
      b.createdAt
    );

  if (olusturma !== 0) {
    return olusturma;
  }


  return a.paymentId.localeCompare(
    b.paymentId
  );
}


function finansV17Sayi_(v) {

  if (typeof v === 'number') {
    return isFinite(v) ? v : 0;
  }


  let s =
    finansMetin_(v)
      .replace(/[₺\s]/g, '');


  if (!s) {
    return 0;
  }


  if (s.includes(',')) {

    s =
      s
        .replace(/\./g, '')
        .replace(',', '.');

  }


  const n =
    Number(s);


  return isFinite(n)
    ? n
    : 0;
}


function finansV17Yuvarla_(n) {

  return Math.round(
    (Number(n) + Number.EPSILON) *
    100
  ) / 100;
}
