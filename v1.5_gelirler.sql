-- Borç ve Gelir Asistanım V1.5
-- Gelir kayıtlarını iki telefonda güvenli biçimde senkronize etmek için bir kez çalıştırın.

create table if not exists public.gelirler (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  gelir_sahibi text not null check (gelir_sahibi in ('Başak','Süleyman')),
  gelir_turu text not null check (gelir_turu in ('Maaş','Özel Ders','Kira Geliri')),
  ogrenci_adi text,
  gelir_tarihi date not null,
  tutar numeric(14,2) not null check (tutar > 0),
  ekleyen text not null default '',
  olusturma_zamani timestamptz not null default now(),
  guncelleme_zamani timestamptz not null default now(),
  constraint gelirler_ozel_ders_ogrenci_kontrol check (
    gelir_turu <> 'Özel Ders' or nullif(btrim(ogrenci_adi), '') is not null
  )
);

alter table public.gelirler enable row level security;

drop policy if exists "Gelirler kendi kayıtlarını yönetir" on public.gelirler;
create policy "Gelirler kendi kayıtlarını yönetir"
on public.gelirler
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.gelirler to authenticated;

create index if not exists gelirler_user_tarih_idx
on public.gelirler (user_id, gelir_tarihi desc);
