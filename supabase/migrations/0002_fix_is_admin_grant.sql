-- 0002_fix_is_admin_grant.sql
--
-- CONTEXTO / ROOT CAUSE:
-- La migración 0001 revoca EXECUTE de public.is_admin() al rol `anon`. Pero
-- las policies admin de tipo `for all using (public.is_admin())` se evalúan
-- TAMBIÉN durante un SELECT anónimo (catálogo público: products, promotions,
-- promotion_products, etc.). Sin EXECUTE, Postgres aborta el SELECT con
-- "permission denied for function is_admin" (SQLSTATE 42501) y las
-- promociones/productos NO cargan para visitantes no autenticados.
--
-- Esta migración deja el estado CANÓNICO (idempotente): anon, authenticated y
-- service_role pueden EJECUTAR is_admin(). Esto NO concede privilegios de
-- admin: la función simplemente devuelve `false` para usuarios no-admin
-- (lee public.profiles por auth.uid()). Solo permite que las policies se
-- evalúen sin abortar la consulta.
--
-- Reconcilia la contradicción entre schema.sql (grant) y 0001 (revoke) para
-- que un `supabase db reset` reproduzca el estado que ya corre en producción.

grant execute on function public.is_admin() to anon, authenticated, service_role;
