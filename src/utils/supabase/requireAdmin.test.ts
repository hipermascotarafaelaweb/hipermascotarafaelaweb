// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { requireAdmin } from './requireAdmin';
import { makeSupabaseClient, type SupabaseMockConfig } from '@/test/supabaseMock';

type Client = Parameters<typeof requireAdmin>[0];
const client = (cfg: SupabaseMockConfig) => makeSupabaseClient(cfg) as unknown as Client;

describe('requireAdmin', () => {
  it('401 si no hay usuario autenticado', async () => {
    const res = await requireAdmin(client({ auth: { data: { user: null }, error: null } }));
    expect(res).toEqual({ ok: false, status: 401, error: 'Unauthorized' });
  });

  it('401 si auth devuelve error', async () => {
    const res = await requireAdmin(client({ auth: { data: { user: null }, error: { message: 'x' } } }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(401);
  });

  it('500 si la verificación is_admin falla', async () => {
    const res = await requireAdmin(client({
      auth: { data: { user: { id: 'u1' } }, error: null },
      rpc: { is_admin: { data: null, error: { message: 'rpc fail' } } },
    }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(500);
  });

  it('403 si el usuario no es admin', async () => {
    const res = await requireAdmin(client({
      auth: { data: { user: { id: 'u1' } }, error: null },
      rpc: { is_admin: { data: false, error: null } },
    }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(403);
  });

  it('ok:true para un admin autenticado', async () => {
    const res = await requireAdmin(client({
      auth: { data: { user: { id: 'u1' } }, error: null },
      rpc: { is_admin: { data: true, error: null } },
    }));
    expect(res).toEqual({ ok: true });
  });
});
