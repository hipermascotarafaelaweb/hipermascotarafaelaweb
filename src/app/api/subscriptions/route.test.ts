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
const valid = { dni: '30123456', product_id: 1, qty: 2, every_days: 30 };

describe('POST /api/subscriptions', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
    mockConfig = {};
    mockLimited = false;
  });

  it('400 con DNI inválido', async () => {
    expect((await call({ ...valid, dni: '12' })).status).toBe(400);
  });

  it('400 con producto inválido', async () => {
    expect((await call({ ...valid, product_id: 0 })).status).toBe(400);
  });

  it('400 con frecuencia fuera de rango', async () => {
    expect((await call({ ...valid, every_days: 3 })).status).toBe(400);
    expect((await call({ ...valid, every_days: 200 })).status).toBe(400);
  });

  it('400 con cantidad inválida', async () => {
    expect((await call({ ...valid, qty: 0 })).status).toBe(400);
  });

  it('429 cuando se supera el rate limit', async () => {
    mockLimited = true;
    expect((await call(valid)).status).toBe(429);
  });

  it('201 crea la suscripción', async () => {
    mockConfig = { tables: { subscriptions: { data: { id: 7, next_at: '2026-07-08' }, error: null } } };
    const res = await call(valid);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.subscription.id).toBe(7);
  });

  it('500 si falla el insert', async () => {
    mockConfig = { tables: { subscriptions: { data: null, error: { message: 'no table' } } } };
    expect((await call(valid)).status).toBe(500);
  });
});
