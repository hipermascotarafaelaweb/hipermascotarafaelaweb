// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeSupabaseClient, jsonRequest, type SupabaseMockConfig } from '@/test/supabaseMock';

let mockConfig: SupabaseMockConfig = {};
vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => makeSupabaseClient(mockConfig),
}));

import { GET, POST, DELETE } from './route';

const admin = {
  auth: { data: { user: { id: 'admin1' } }, error: null },
  rpc: { is_admin: { data: true, error: null } },
};
const notAdmin = {
  auth: { data: { user: { id: 'u2' } }, error: null },
  rpc: { is_admin: { data: false, error: null } },
};

describe('Admin promotions API — seguridad y validación', () => {
  beforeEach(() => { mockConfig = {}; });

  it('GET 401 sin usuario autenticado', async () => {
    mockConfig = { auth: { data: { user: null }, error: null } };
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('GET 403 si el usuario no es admin', async () => {
    mockConfig = notAdmin;
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('DELETE 403 si el usuario no es admin', async () => {
    mockConfig = notAdmin;
    const res = await DELETE(jsonRequest({ id: 1 }));
    expect(res.status).toBe(403);
  });

  it('POST 400 si falta el título (admin autenticado)', async () => {
    mockConfig = { ...admin };
    const res = await POST(jsonRequest({ discount_type: 'percent', discount_percent: 10 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/título/i);
  });

  it('POST 400 si el descuento es inválido', async () => {
    mockConfig = { ...admin };
    const res = await POST(jsonRequest({ title: 'Promo', discount_type: 'percent' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/descuento/i);
  });

  it('POST 201 crea la promoción para un admin', async () => {
    mockConfig = {
      ...admin,
      tables: { promotions: { data: { id: 1, title: 'Promo' }, error: null } },
    };
    const res = await POST(jsonRequest({ title: 'Promo', discount_type: 'percent', discount_percent: 10 }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.promotion.id).toBe(1);
  });
});
