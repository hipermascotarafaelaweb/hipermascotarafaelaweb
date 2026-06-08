-- Fix checkout permissions - RLS and GRANT issues
-- Fixes: https://github.com/hipermascotarafaela/issues

-- 1. GRANT explícito a service_role para que ejecute las funciones
GRANT EXECUTE ON FUNCTION public.create_order_with_stock(text, text, text, text, jsonb, numeric, text, numeric, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_coupon_use(bigint) TO service_role;

-- 2. Agregar política RLS que permita inserciones sin usuario autenticado
-- (cuando se ejecuta desde una función con security definer, auth.uid() es NULL)
DROP POLICY IF EXISTS "insertar pedidos desde checkout" ON orders;
CREATE POLICY "insertar pedidos desde checkout" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL);
