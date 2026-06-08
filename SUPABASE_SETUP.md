# Supabase Setup - Checkout Permissions Fix

## Situación Actual

El endpoint de checkout ha sido refactorizado para insertar **directamente** en la tabla `orders` en lugar de usar RPC. Esto requiere ajustes de permisos y RLS en Supabase.

## ✅ Cambios Realizados

1. **Código**: `src/app/api/checkout/route.ts` - Ya usa `fullAddress` en el email
2. **Migración**: `supabase/migrations/0006_fix_checkout_permissions.sql` - Creada y pusheada a GitHub

## 🔧 Pasos para Ejecutar en Supabase

### Opción 1: Usar Supabase CLI (Recomendado)

```bash
supabase db push
```

Esto ejecutará automáticamente la migración `0006_fix_checkout_permissions.sql`

### Opción 2: Ejecutar Manualmente en SQL Editor

1. Ve a https://app.supabase.com → [Tu Proyecto] → SQL Editor
2. Copia y pega el contenido de abajo
3. Click en **Run**

```sql
-- Fix checkout permissions - RLS and GRANT issues

-- 1. GRANT explícito a service_role para que ejecute las funciones
GRANT EXECUTE ON FUNCTION public.create_order_with_stock(text, text, text, text, jsonb, numeric, text, numeric, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_coupon_use(bigint) TO service_role;

-- 2. Agregar política RLS que permita inserciones sin usuario autenticado
-- (cuando se ejecuta desde una función con security definer, auth.uid() es NULL)
DROP POLICY IF EXISTS "insertar pedidos desde checkout" ON orders;
CREATE POLICY "insertar pedidos desde checkout" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL);
```

## ✅ Verificar que Funciona

Después de ejecutar el SQL, el checkout debería funcionar sin errores de permisos.

### Test en Local

```bash
npm run test
```

### Test en Producción

Hacer un pedido de prueba desde https://hipermascota-rafaela.vercel.app/

## 📝 Notas

- La migración también está versionada en Git
- Si usas Supabase CLI, la migración se ejecutará automáticamente en el próximo `db push`
- Los permisos se aplican solo a `service_role`, que es usado por el backend
- Los usuarios públicos (anon) no pueden insertar pedidos directamente (seguro)
