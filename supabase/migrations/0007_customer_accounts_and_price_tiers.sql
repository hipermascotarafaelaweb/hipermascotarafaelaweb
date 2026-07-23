-- ============================================================
--  MIGRACIÓN 0007 — Cuentas de cliente + precios por cantidad
--  1. Extiende profiles con los datos del registro de cliente.
--  2. El trigger de alta copia esos datos desde raw_user_meta_data
--     (los manda el formulario de /registro vía supabase.auth.signUp).
--  3. Tabla product_price_tiers: escalones de precio por cantidad,
--     definidos por el admin, visibles solo para usuarios logueados
--     (mismo criterio que el precio base, oculto en la UI hasta
--     iniciar sesión).
--  IDEMPOTENTE: seguro correr más de una vez.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Datos de cliente en profiles
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists dni text;

-- ------------------------------------------------------------
-- 2. Trigger de alta: copia los datos del registro
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (user_id, is_admin, first_name, last_name, phone, dni)
  values (
    new.id,
    false,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'dni'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 3. Tabla de escalones de precio por cantidad
-- ------------------------------------------------------------
create table if not exists public.product_price_tiers (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  min_qty integer not null check (min_qty > 0),
  price numeric not null check (price > 0),
  created_at timestamptz default now(),
  unique (product_id, min_qty)
);

alter table public.product_price_tiers enable row level security;

-- Cualquier usuario logueado (cliente registrado o admin) ve los escalones.
-- Los visitantes anónimos no: mismo criterio que el precio base oculto en la UI.
drop policy if exists "logueados ven escalones de precio" on public.product_price_tiers;
create policy "logueados ven escalones de precio" on public.product_price_tiers
  for select using (auth.uid() is not null);

drop policy if exists "admin agrega escalones de precio" on public.product_price_tiers;
create policy "admin agrega escalones de precio" on public.product_price_tiers
  for insert with check (public.is_admin());

drop policy if exists "admin actualiza escalones de precio" on public.product_price_tiers;
create policy "admin actualiza escalones de precio" on public.product_price_tiers
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin borra escalones de precio" on public.product_price_tiers;
create policy "admin borra escalones de precio" on public.product_price_tiers
  for delete using (public.is_admin());
