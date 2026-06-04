import type { createClient } from '@/utils/supabase/server';

type ServerClient = Awaited<ReturnType<typeof createClient>>;

type AdminCheck =
  | { ok: true }
  | { ok: false; status: number; error: string };

/**
 * Defensa en profundidad para rutas de administración.
 *
 * Las policies RLS ya bloquean a no-admins en la capa de base de datos
 * (every write usa `with check (public.is_admin())`), pero el código de la
 * ruta NO debe confiar únicamente en eso: aquí verificamos explícitamente
 * que el usuario (1) esté autenticado y (2) sea admin vía la función
 * `public.is_admin()`. Si la policy se relajara o la ruta pasara a usar la
 * service-role key, este chequeo seguiría protegiendo el endpoint.
 */
export async function requireAdmin(supabase: ServerClient): Promise<AdminCheck> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');

  if (rpcError) {
    return { ok: false, status: 500, error: 'Authorization check failed' };
  }

  if (!isAdmin) {
    return { ok: false, status: 403, error: 'Forbidden' };
  }

  return { ok: true };
}
