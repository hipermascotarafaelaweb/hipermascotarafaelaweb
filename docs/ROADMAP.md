# Roadmap técnico — Hipermascota Rafaela

Specs accionables para 3 features de alto valor. Cada una incluye schema,
endpoints, UI y esfuerzo estimado. **No están implementadas**: requieren
migraciones sobre la base de Supabase (aplicar con revisión) y decisiones de
producto/UX.

> Convención del proyecto: las migraciones viven en `supabase/migrations/`,
> son idempotentes y usan `public.is_admin()` para las policies de admin.

---

## 1. Suscripciones recurrentes de alimento ("Plan Manada")

**Valor:** recurrencia y LTV en clientes de alto consumo (razas grandes,
multi-mascota). Reaprovecha el flujo de WhatsApp existente; sin pasarela de pago.

### Schema (`supabase/migrations/0003_subscriptions.sql`)
```sql
create table if not exists public.subscriptions (
  id           bigint generated always as identity primary key,
  customer_dni text not null,
  product_id   bigint not null references public.products(id),
  qty          int not null default 1 check (qty > 0),
  every_days   int not null check (every_days between 7 and 120),
  next_at      date not null,
  active       boolean not null default true,
  created_at   timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy "admin subs" on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());
```

### Endpoints
- `POST /api/subscriptions` — alta (cliente, valida DNI + product_id).
- Cron (Vercel Cron o Supabase scheduled fn): cada día busca `next_at <= today`,
  genera un link de WhatsApp de re-pedido y avanza `next_at += every_days`.

### UI
- Checkbox "Repetir este pedido cada [30/45/60] días" en el `CartDrawer`.
- Sección "Mis suscripciones" en `/historial` (buscar por DNI, pausar/cancelar).

### Esfuerzo: ~2-3 días · **Tests:** lógica de `next_at`, cron idempotente.

---

## 2. Gestión de inventario con alertas y reposición sugerida

**Valor:** evita quiebres del top de ventas y capital muerto. El carrito ya
respeta `stock`; falta el lado operativo.

### Schema (`supabase/migrations/0004_inventory.sql`)
```sql
alter table public.products
  add column if not exists low_stock_threshold int not null default 5;

-- Vista de velocidad de venta (últimos 30 días) desde orders.items (jsonb)
create or replace view public.product_sales_velocity as
select (i->>'product_id')::bigint as product_id,
       sum((i->>'qty')::int) as sold_30d
from public.orders o
cross join lateral jsonb_array_elements(o.items) as i
where o.created_at > now() - interval '30 days'
group by 1;
```

### Endpoints / UI (admin)
- `GET /api/admin/inventory/alerts` (protegido con `requireAdmin`): productos con
  `stock <= low_stock_threshold`, ordenados por velocidad de venta.
- Card "Reposición sugerida" en `/admin/dashboard`: qué reponer y cuánto
  (sugerido = velocidad − stock actual).

### Esfuerzo: ~2 días · **Tests:** cálculo de sugerido, guard admin (patrón ya testeado).

---

## 3. Programa de fidelización + filtros avanzados de catálogo

**Valor:** retención por DNI (ya identificamos al cliente) + descubrimiento de
producto para clientes con necesidades específicas.

### Fidelización — Schema (`supabase/migrations/0005_loyalty.sql`)
```sql
create table if not exists public.loyalty_points (
  customer_dni text primary key,
  points       int not null default 0,
  updated_at   timestamptz default now()
);
alter table public.loyalty_points enable row level security;
create policy "admin loyalty" on public.loyalty_points
  for all using (public.is_admin()) with check (public.is_admin());
```
- En `create_order_with_stock`: sumar `floor(total/1000)` puntos al DNI.
- Canje: generar cupón (tabla `coupons` ya existe) a partir de puntos.

### Filtros avanzados de catálogo
- Agregar a `products`: `size` (chico/mediano/grande), `life_stage`
  (cachorro/adulto/senior), `diet` (sin granos/hipoalergénico).
- Extender `ProductGrid` (ya filtra client-side) con estos selects. **Bajo
  riesgo:** el filtrado ya es client-side y está cubierto por E2E.

### Esfuerzo: ~3-4 días · **Tests:** suma/canje de puntos, nuevos filtros en `ProductGrid`.

---

## Estado de la suite de tests (base para construir lo de arriba)
- **81 unit/integration** (Vitest): utils, store, rate-limit, y rutas API
  (checkout, cupones, historial, by-dni, promociones admin, requireAdmin).
- **13 E2E** (Playwright): catálogo, carrito y accesibilidad.
- **CI** (`.github/workflows/ci.yml`): lint → unit → build → e2e en cada push.

## Deuda conocida
- **a11y color-contrast:** ~13 nodos en home, 10 en catálogo (tonos `text-gray-400/500`
  y badges). Requiere decidir tonos de marca; el test los reporta como warning.
- **Sentry:** solo está el init de cliente (`sentry.client.config.ts`). Faltan
  `sentry.server.config.ts` + `instrumentation.ts` para capturar errores
  server-side (rutas API). DSN no seteado → hoy no reporta nada.
