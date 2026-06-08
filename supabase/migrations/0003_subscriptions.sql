-- ============================================================
--  MIGRACIÓN 0003 — Suscripciones recurrentes ("Plan Manada")
--  Clientes de alto consumo repiten un pedido cada N días.
--  IDEMPOTENTE.
-- ============================================================

create table if not exists public.subscriptions (
  id           bigint generated always as identity primary key,
  customer_dni text not null,
  product_id   bigint not null references public.products(id) on delete cascade,
  qty          int not null default 1 check (qty > 0),
  every_days   int not null check (every_days between 7 and 120),
  next_at      date not null default (now() + interval '30 days'),
  active       boolean not null default true,
  created_at   timestamptz default now()
);

create index if not exists subscriptions_due_idx
  on public.subscriptions (next_at) where active;
create index if not exists subscriptions_dni_idx
  on public.subscriptions (customer_dni);

alter table public.subscriptions enable row level security;

-- Solo el admin gestiona suscripciones desde la capa de datos. El alta pública
-- entra por la ruta API con service-role (igual que checkout).
drop policy if exists "admin subs" on public.subscriptions;
create policy "admin subs" on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());
