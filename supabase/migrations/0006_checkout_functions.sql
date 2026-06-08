-- ============================================================
--  MIGRACIÓN 0006 — Funciones RPC para checkout
--  IDEMPOTENTE.
-- ============================================================

-- ---------- Crear pedido con descuento de stock ----------
create or replace function public.create_order_with_stock(
  customer_name text,
  customer_dni text,
  customer_phone text,
  customer_address text,
  items jsonb,
  total_amount numeric,
  coupon_code text default null,
  coupon_discount numeric default 0,
  status text default 'Pendiente'
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id bigint;
  v_item jsonb;
  v_product_id int;
  v_qty int;
begin
  -- Insertar el pedido
  insert into public.orders (
    customer_name,
    customer_dni,
    customer_phone,
    customer_address,
    items,
    total_amount,
    coupon_code,
    coupon_discount,
    status
  ) values (
    customer_name,
    customer_dni,
    customer_phone,
    customer_address,
    items,
    total_amount,
    coupon_code,
    coupon_discount,
    status
  )
  returning id into v_order_id;

  -- Decrementar stock y agregar puntos de lealtad
  for v_item in select jsonb_array_elements(items)
  loop
    v_product_id := (v_item->>'product_id')::int;
    v_qty := (v_item->>'qty')::int;

    -- Decrementar stock
    update public.products
    set stock = stock - v_qty
    where id = v_product_id;

    -- Agregar puntos de lealtad (1 punto cada $1000)
    perform public.add_loyalty_points(customer_dni, (v_item->>'price')::numeric * v_qty);
  end loop;

  return json_build_object('id', v_order_id);
end;
$$;

revoke execute on function public.create_order_with_stock(text, text, text, text, jsonb, numeric, text, numeric, text) from anon, public;
grant execute on function public.create_order_with_stock(text, text, text, text, jsonb, numeric, text, numeric, text) to service_role;

-- ---------- Incrementar uso de cupón ----------
create or replace function public.increment_coupon_use(coupon_id bigint)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_max_uses int;
  v_uses_count int;
begin
  select max_uses, uses_count
  into v_max_uses, v_uses_count
  from public.coupons
  where id = coupon_id;

  if v_max_uses is not null and v_uses_count >= v_max_uses then
    raise exception 'Cupón agotado';
  end if;

  update public.coupons
  set uses_count = uses_count + 1
  where id = coupon_id;
end;
$$;

revoke execute on function public.increment_coupon_use(bigint) from anon, public;
grant execute on function public.increment_coupon_use(bigint) to service_role;

-- ---------- Decrementar stock (opcional) ----------
create or replace function public.decrement_stock(p_product_id bigint, p_qty int)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.products
  set stock = stock - p_qty
  where id = p_product_id;
end;
$$;

revoke execute on function public.decrement_stock(bigint, int) from anon, public;
grant execute on function public.decrement_stock(bigint, int) to service_role;
