-- KURUM FINANS ASISTANIM - Supabase tek seferlik veritabani kurulumu
-- Bu dosyayi Supabase > SQL Editor > New query alanina yapistirip Run deyin.

create extension if not exists pgcrypto;

create table if not exists public.borclar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ad text not null,
  tur text not null default 'Diger',
  ilk_tutar numeric(14,2) not null default 0 check (ilk_tutar >= 0),
  kalan_tutar numeric(14,2) not null default 0 check (kalan_tutar >= 0),
  faiz_orani numeric(8,2) not null default 0 check (faiz_orani >= 0),
  aylik_odeme numeric(14,2) not null default 0 check (aylik_odeme >= 0),
  vade_tarihi date,
  tekrar text not null default 'monthly' check (tekrar in ('monthly','oneoff')),
  notlar text not null default '',
  durum text not null default 'active' check (durum in ('active','closed')),
  ekleyen text not null default '',
  olusturma_zamani timestamptz not null default now(),
  guncelleme_zamani timestamptz not null default now()
);

create table if not exists public.harcamalar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tarih date not null default current_date,
  kategori text not null default 'Diger',
  aciklama text not null,
  tutar numeric(14,2) not null check (tutar > 0),
  odeme_yontemi text not null default 'Banka',
  notlar text not null default '',
  ekleyen text not null default '',
  olusturma_zamani timestamptz not null default now(),
  guncelleme_zamani timestamptz not null default now()
);

create table if not exists public.odemeler (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  borc_id uuid not null references public.borclar(id) on delete cascade,
  tarih date not null default current_date,
  tutar numeric(14,2) not null check (tutar > 0),
  notlar text not null default '',
  ekleyen text not null default '',
  olusturma_zamani timestamptz not null default now()
);

create table if not exists public.ayarlar (
  user_id uuid primary key references auth.users(id) on delete cascade,
  kurum_adi text not null default '',
  aylik_gelir numeric(14,2) not null default 0 check (aylik_gelir >= 0),
  sabit_gider numeric(14,2) not null default 0 check (sabit_gider >= 0),
  rezerv numeric(14,2) not null default 0 check (rezerv >= 0),
  guncelleme_zamani timestamptz not null default now()
);

alter table public.borclar enable row level security;
alter table public.harcamalar enable row level security;
alter table public.odemeler enable row level security;
alter table public.ayarlar enable row level security;

-- Her kurum hesabi yalniz kendi satirlarini gorur/yazar.
drop policy if exists "borclar_kendi_verisi" on public.borclar;
create policy "borclar_kendi_verisi" on public.borclar for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "harcamalar_kendi_verisi" on public.harcamalar;
create policy "harcamalar_kendi_verisi" on public.harcamalar for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "odemeler_kendi_verisi" on public.odemeler;
create policy "odemeler_kendi_verisi" on public.odemeler for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "ayarlar_kendi_verisi" on public.ayarlar;
create policy "ayarlar_kendi_verisi" on public.ayarlar for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_guncelleme_zamani() returns trigger language plpgsql as $$
begin new.guncelleme_zamani = now(); return new; end; $$;

drop trigger if exists trg_borclar_guncelleme on public.borclar;
create trigger trg_borclar_guncelleme before update on public.borclar for each row execute function public.set_guncelleme_zamani();
drop trigger if exists trg_harcamalar_guncelleme on public.harcamalar;
create trigger trg_harcamalar_guncelleme before update on public.harcamalar for each row execute function public.set_guncelleme_zamani();
drop trigger if exists trg_ayarlar_guncelleme on public.ayarlar;
create trigger trg_ayarlar_guncelleme before update on public.ayarlar for each row execute function public.set_guncelleme_zamani();

-- Borc odemesini tek transaction icinde kaydeder ve bakiyeyi dusurur.
create or replace function public.borc_odeme_kaydet(
  p_borc_id uuid,
  p_tutar numeric,
  p_tarih date,
  p_notlar text default '',
  p_ekleyen text default ''
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_borc public.borclar%rowtype;
  v_yeni_kalan numeric(14,2);
  v_yeni_vade date;
begin
  if auth.uid() is null then raise exception 'Oturum gerekli'; end if;
  if p_tutar is null or p_tutar <= 0 then raise exception 'Odeme tutari sifirdan buyuk olmali'; end if;

  select * into v_borc from public.borclar where id = p_borc_id and user_id = auth.uid() for update;
  if not found then raise exception 'Borc bulunamadi'; end if;

  v_yeni_kalan := greatest(0, v_borc.kalan_tutar - p_tutar);
  v_yeni_vade := v_borc.vade_tarihi;
  if v_borc.tekrar = 'monthly' and v_borc.vade_tarihi is not null and p_tarih >= (v_borc.vade_tarihi - 7) then
    v_yeni_vade := (v_borc.vade_tarihi + interval '1 month')::date;
  end if;

  insert into public.odemeler(user_id, borc_id, tarih, tutar, notlar, ekleyen)
  values(auth.uid(), p_borc_id, coalesce(p_tarih,current_date), p_tutar, coalesce(p_notlar,''), coalesce(p_ekleyen,''));

  update public.borclar
  set kalan_tutar = v_yeni_kalan,
      durum = case when v_yeni_kalan <= 0 then 'closed' else 'active' end,
      vade_tarihi = v_yeni_vade
  where id = p_borc_id and user_id = auth.uid();

  return jsonb_build_object('basarili',true,'kalan_tutar',v_yeni_kalan,'durum',case when v_yeni_kalan <= 0 then 'closed' else 'active' end);
end; $$;

revoke all on function public.borc_odeme_kaydet(uuid,numeric,date,text,text) from public;
grant execute on function public.borc_odeme_kaydet(uuid,numeric,date,text,text) to authenticated;

-- Frontend Data API erisimi: RLS yine satir bazinda korur.
grant select, insert, update, delete on public.borclar to authenticated;
grant select, insert, update, delete on public.harcamalar to authenticated;
grant select, insert, update, delete on public.odemeler to authenticated;
grant select, insert, update, delete on public.ayarlar to authenticated;
