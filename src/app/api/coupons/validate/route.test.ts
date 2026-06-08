// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeSupabaseClient, jsonRequest, type SupabaseMockConfig } from '@/test/supabaseMock';
import type { NextRequest } from 'next/server';

let mockConfig: SupabaseMockConfig = {};
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => makeSupabaseClient(mockConfig),
}));

import { POST } from './route';

const call = (body: unknown) => POST(jsonRequest(body) as unknown as NextRequest);

const validCoupon = {
  id: 1, code: 'PROMO10', discount_percent: 10, max_uses: 100, uses_count: 5,
  valid_from: '2020-01-01', valid_until: null, active: true, created_at: '2020-01-01',
};

describe('POST /api/coupons/validate', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    mockConfig = {};
  });

  it('400 si falta el código', async () => {
    const res = await call({});
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/requerido/i);
  });

  it('404 si el cupón no existe', async () => {
    mockConfig = { tables: { coupons: { data: null, error: { message: 'not found' } } } };
    const res = await call({ code: 'NOPE' });
    expect(res.status).toBe(404);
  });

  it('200 y devuelve solo code + discount_percent para un cupón válido', async () => {
    mockConfig = { tables: { coupons: { data: validCoupon, error: null } } };
    const res = await call({ code: 'promo10' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.coupon).toEqual({ code: 'PROMO10', discount_percent: 10 });
    // No filtra datos sensibles
    expect(json.coupon.uses_count).toBeUndefined();
    expect(json.coupon.id).toBeUndefined();
  });

  it('400 si el cupón está expirado', async () => {
    mockConfig = { tables: { coupons: { data: { ...validCoupon, valid_until: '2000-01-01' }, error: null } } };
    const res = await call({ code: 'PROMO10' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/expirado/i);
  });

  it('400 si el cupón está agotado (uses_count >= max_uses)', async () => {
    mockConfig = { tables: { coupons: { data: { ...validCoupon, max_uses: 5, uses_count: 5 }, error: null } } };
    const res = await call({ code: 'PROMO10' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/agotado/i);
  });
});
