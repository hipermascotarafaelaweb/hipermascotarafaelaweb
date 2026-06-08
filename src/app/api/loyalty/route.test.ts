// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeSupabaseClient, jsonRequest, type SupabaseMockConfig } from '@/test/supabaseMock';
import type { NextRequest } from 'next/server';

let mockConfig: SupabaseMockConfig = {};
let mockLimited = false;
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => makeSupabaseClient(mockConfig),
}));
vi.mock('@/utils/rateLimit', () => ({ isRateLimited: async () => mockLimited }));

import { POST } from './route';

const call = (body: unknown) => POST(jsonRequest(body) as unknown as NextRequest);

describe('POST /api/loyalty', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
    mockConfig = {};
    mockLimited = false;
  });

  it('400 con DNI inválido', async () => {
    expect((await call({ dni: 'x' })).status).toBe(400);
  });

  it('429 cuando se supera el rate limit', async () => {
    mockLimited = true;
    expect((await call({ dni: '30123456' })).status).toBe(429);
  });

  it('devuelve los puntos del cliente', async () => {
    mockConfig = { tables: { loyalty_points: { data: { points: 42 }, error: null } } };
    const res = await call({ dni: '30123456' });
    expect(res.status).toBe(200);
    expect((await res.json()).points).toBe(42);
  });

  it('0 puntos si no hay fila (PGRST116)', async () => {
    mockConfig = { tables: { loyalty_points: { data: null, error: { code: 'PGRST116' } } } };
    const res = await call({ dni: '30123456' });
    expect(res.status).toBe(200);
    expect((await res.json()).points).toBe(0);
  });

  it('500 ante un error inesperado', async () => {
    mockConfig = { tables: { loyalty_points: { data: null, error: { code: 'OTHER' } } } };
    expect((await call({ dni: '30123456' })).status).toBe(500);
  });
});
