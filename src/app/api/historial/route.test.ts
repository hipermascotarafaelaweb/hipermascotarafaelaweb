// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeSupabaseClient, jsonRequest, type SupabaseMockConfig } from '@/test/supabaseMock';
import type { NextRequest } from 'next/server';

let mockConfig: SupabaseMockConfig = {};
let mockLimited = false;
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => makeSupabaseClient(mockConfig),
}));
vi.mock('@/utils/rateLimit', () => ({
  isRateLimited: async () => mockLimited,
}));

import { POST } from './route';

const call = (body: unknown) => POST(jsonRequest(body) as unknown as NextRequest);

describe('POST /api/historial', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    mockConfig = {};
    mockLimited = false;
  });

  it('400 si falta el DNI', async () => {
    expect((await call({})).status).toBe(400);
  });

  it('400 si el DNI tiene formato inválido', async () => {
    expect((await call({ dni: 'abc' })).status).toBe(400);
  });

  it('429 cuando se supera el rate limit', async () => {
    mockLimited = true;
    expect((await call({ dni: '30123456' })).status).toBe(429);
  });

  it('401 si el DNI no está en customers', async () => {
    mockConfig = { tables: { customers: { data: null, error: { message: 'not found' } } } };
    const res = await call({ dni: '30123456' });
    expect(res.status).toBe(401);
    expect((await res.json()).error).toMatch(/no encontrado/i);
  });

  it('200 y devuelve los pedidos del cliente', async () => {
    mockConfig = {
      tables: {
        customers: { data: { phone: '3492111222' }, error: null },
        orders: {
          data: [
            { id: 1, customer_dni: '30123456', created_at: '2024-01-01', total_amount: 5000, status: 'Entregado' },
          ],
          error: null,
        },
      },
    };
    const res = await call({ dni: '30123456' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.orders).toHaveLength(1);
    expect(json.orders[0].id).toBe(1);
  });

  it('500 si falla la consulta de pedidos', async () => {
    mockConfig = {
      tables: {
        customers: { data: { phone: '3492111222' }, error: null },
        orders: { data: null, error: { message: 'boom' } },
      },
    };
    expect((await call({ dni: '30123456' })).status).toBe(500);
  });
});
