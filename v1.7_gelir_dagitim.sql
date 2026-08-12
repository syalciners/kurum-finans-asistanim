-- BS OFİS BÜTÇE / Kurum Finans Asistanı V1.7
-- Amaç: Tek bir StudentPayments tahsilatını, gerçekleşen derslerin gelir sahibine göre
-- birden fazla gelir satırına bölmeye izin vermek.
--
-- Örnek:
-- PaymentID = P1, Tutar = 8000
-- Süleyman payı     = 4000
-- Kurum Kasası payı = 4000
--
-- StudentPayments toplamı değişmez; yalnız gelir sahipliği dağıtılır.

begin;

-- V1.6'da aynı kaynak kaydı için yalnızca tek gelir satırına izin veren indeks vardı.
-- Bu, tek tahsilatın birden fazla gelir sahibine bölünmesini engelliyordu.
drop index if exists public.gelirler_kaynak_kaydi_tekil;

-- Aynı PaymentID, aynı gelir sahibine ikinci kez yazılamaz.
-- Fakat aynı PaymentID farklı gelir sahiplerine ayrı satırlar olarak yazılabilir.
create unique index if not exists gelirler_kaynak_kaydi_sahip_tekil
on public.gelirler (
  user_id,
  kaynak,
  kaynak_kayit_id,
  gelir_sahibi
)
where kaynak_kayit_id is not null;

commit;
