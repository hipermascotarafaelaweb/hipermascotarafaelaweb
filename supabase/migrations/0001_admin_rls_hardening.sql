-- ============================================================
--  MIGRACIÓN 0001 — Rol de admin real + endurecimiento RLS
--  Reemplaza "auth.role() = 'authenticated'" por public.is_admin().
--  Cierra el insert público en orders/customers.
--  Asegura las funciones RPC (search_path + revoke).
--  IDEMPOTENTE: seguro correr más de una vez.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabla de perfiles (1 fila por usuario de auth)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- ------------------------------------------------------------
-- 2. Función is_admin() — SECURITY DEFINER (lee profiles saltándose RLS)
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select coalesce(
    (select is_admin from public.profiles where user_id = auth.uid()),
    false
  );
$$;

revoke execute on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated, service_role;

-- ------------------------------------------------------------
-- 3. RLS de profiles: cada uno ve su perfil; admin ve todos.
--    No hay policy de insert/update -> solo el trigger o service role escriben.
-- ------------------------------------------------------------
drop policy if exists "perfil propio o admin" on public.profiles;
create policy "perfil propio o admin" on public.profiles
  for select using (auth.uid() = user_id or public.is_admin());

-- ------------------------------------------------------------
-- 4. Trigger: crear perfil automáticamente cuando se registra un usuario
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (user_id, is_admin)
  values (new.id, false)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 5. Backfill: perfil para usuarios ya existentes
-- ------------------------------------------------------------
insert into public.profiles (user_id, is_admin)
select id, false from auth.users
on conflict (user_id) do nothing;

-- ------------------------------------------------------------
-- 6. Marcar al DUEÑO como admin (por email)
-- ------------------------------------------------------------
update public.profiles p set is_admin = true
from auth.users u
where u.id = p.user_id
  and u.email = 'hipermascotarafaelaweb@gmail.com';

-- ============================================================
--  7. REESCRIBIR POLICIES ADMIN -> public.is_admin()
-- ============================================================
drop policy if exists "admin categorias" on categories;
create policy "admin categorias" on categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin productos" on products;
create policy "admin productos" on products
  for all using (public.is_admin()) with check (public.is_admin());

-- customers: el admin necesita CRUD completo (antes solo SELECT -> editar/borrar estaba roto)
drop policy if exists "admin clientes" on customers;
create policy "admin clientes" on customers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin pedidos" on orders;
create policy "admin pedidos" on orders
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin cupones" on coupons;
create policy "admin cupones" on coupons
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin promociones" on promotions;
create policy "admin promociones" on promotions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin promociones productos" on promotion_products;
create policy "admin promociones productos" on promotion_products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin promociones categorias" on promotion_categories;
create policy "admin promociones categorias" on promotion_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Storage (fotos de productos)
drop policy if exists "admin sube fotos" on storage.objects;
create policy "admin sube fotos" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "admin edita fotos" on storage.objects;
create policy "admin edita fotos" on storage.objects
  for update using (bucket_id = 'products' and public.is_admin());

drop policy if exists "admin borra fotos" on storage.objects;
create policy "admin borra fotos" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());

-- ============================================================
--  8. CERRAR INSERT PÚBLICO en orders/customers
--     El checkout usa SERVICE ROLE (bypassa RLS), no necesita estas policies.
--     Esto elimina el vector de spam directo con la anon key.
-- ============================================================
drop policy if exists "alta pedidos desde la web" on orders;
drop policy if exists "alta clientes desde la web" on customers;

-- ============================================================
--  9. ASEGURAR FUNCIONES RPC (search_path + revoke a anon/public)
--     Loop dinámico: solo toca las que existan, con su firma real.
-- ============================================================
do $$
declare
  fn record;
begin
  for fn in
    select oid, proname, pg_get_function_identity_arguments(oid) as args
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname in ('create_order_with_stock', 'increment_coupon_use', 'decrement_stock')
  loop
    execute format('alter function public.%I(%s) set search_path = public, pg_temp', fn.proname, fn.args);
    execute format('revoke execute on function public.%I(%s) from anon, public', fn.proname, fn.args);
    raise notice 'Asegurada: %(%)', fn.proname, fn.args;
  end loop;
end $$;
