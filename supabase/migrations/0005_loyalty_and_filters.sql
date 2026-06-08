-- ============================================================
--  MIGRACIÓN 0005 — Fidelización por DNI + filtros avanzados de catálogo
--  IDEMPOTENTE.
-- ============================================================

-- ---------- Fidelización ----------
create table if not exists public.loyalty_points (
  customer_dni text primary key,
  points       int not null default 0 check (points >= 0),
  updated_at   timestamptz default now()
);

alter table public.loyalty_points enable row level security;

drop policy if exists "admin loyalty" on public.loyalty_points;
create policy "admin loyalty" on public.loyalty_points
  for all using (public.is_admin()) with check (public.is_admin());

-- Suma puntos a un DNI (1 punto cada $1000). SECURITY DEFINER: la ruta de
-- checkout (service-role) la invoca tras crear el pedido.
create or replace function public.add_loyalty_points(p_dni text, p_amount numeric)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.loyalty_points (customer_dni, points, updated_at)
  values (p_dni, floor(p_amount / 1000)::int, now())
  on conflict (customer_dni) do update
    set points = public.loyalty_points.points + floor(p_amount / 1000)::int,
        updated_at = now();
$$;

revoke execute on function public.add_loyalty_points(text, numeric) from anon, public;
grant execute on function public.add_loyalty_points(text, numeric) to service_role;

-- ---------- Filtros avanzados de catálogo ----------
-- Columnas opcionales: el catálogo las usa solo si están pobladas (degradación
-- elegante en el cliente). pet_type ya existe.
alter table public.products
  add column if not exists size       text,   -- chico | mediano | grande
  add column if not exists life_stage text,   -- cachorro | adulto | senior
  add column if not exists diet       text;   -- sin_granos | hipoalergenico | estandar
