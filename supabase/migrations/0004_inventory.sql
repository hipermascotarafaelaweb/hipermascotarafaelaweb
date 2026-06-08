-- ============================================================
--  MIGRACIÓN 0004 — Inventario: umbral de bajo stock + velocidad de venta
--  IDEMPOTENTE.
-- ============================================================

alter table public.products
  add column if not exists low_stock_threshold int not null default 5;

-- Velocidad de venta de los últimos 30 días, derivada de orders.items (jsonb).
create or replace view public.product_sales_velocity as
select
  (i->>'product_id')::bigint as product_id,
  sum((i->>'qty')::int)      as sold_30d
from public.orders o
cross join lateral jsonb_array_elements(o.items) as i
where o.created_at > now() - interval '30 days'
group by 1;

-- La vista hereda las policies de las tablas base; solo el admin lee orders.
revoke all on public.product_sales_velocity from anon;
grant select on public.product_sales_velocity to authenticated, service_role;
