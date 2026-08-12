-- Borç ve Gelir Asistanım V1.6
-- BS Ofis / StudentPayments entegrasyonu için bir kez çalıştırın.
-- V1.5 gelirler tablosunu korur; yalnız gerekli alanları ekler.

alter table public.gelirler
  add column if not exists kaynak text,
  add column if not exists kaynak_kayit_id text,
  add column if not exists kaynak_ogrenci_id text,
  add column if not exists otomatik_aktarim boolean not null default false;

-- V1.5'te yalnız Başak / Süleyman vardı. V1.6'da Kurum Kasası da gelir sahibi olabilir.
alter table public.gelirler
  drop constraint if exists gelirler_gelir_sahibi_check;

alter table public.gelirler
  add constraint gelirler_gelir_sahibi_check
  check (gelir_sahibi in ('Başak','Süleyman','Kurum Kasası'));

-- Aynı StudentPayments kaydı ikinci kez gelir oluşturmasın.
create unique index if not exists gelirler_kaynak_kaydi_tekil
on public.gelirler (user_id, kaynak, kaynak_kayit_id)
where kaynak_kayit_id is not null;

create index if not exists gelirler_kaynak_ogrenci_idx
on public.gelirler (user_id, kaynak_ogrenci_id)
where kaynak_ogrenci_id is not null;
