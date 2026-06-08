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

const customer = {
  first_name: 'Juan', last_name: 'Pérez', dni: '30123456', phone: '3492111222',
  street: 'San Martín 100', city: 'Rafaela', province: 'Santa Fe', postal_code: '2300',
};

const okOrderRpc = { rpc: { create_order_with_stock: { data: { id: 123 }, error: null } } };

describe('POST /api/checkout', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
    delete process.env.RESEND_API_KEY;
    mockConfig = {};
    mockLimited = false;
  });

  it('429 cuando se supera el rate limit', async () => {
    mockLimited = true;
    expect((await call({ items: [{ product_id: 1, qty: 1 }], customer })).status).toBe(429);
  });

  it('400 con carrito vacío', async () => {
    expect((await call({ items: [], customer })).status).toBe(400);
  });

  it('400 con DNI inválido', async () => {
    const res = await call({ items: [{ product_id: 1, qty: 1 }], customer: { ...customer, dni: '12' } });
    expect(res.status).toBe(400);
  });

  it('400 con datos del cliente incompletos', async () => {
    const res = await call({ items: [{ product_id: 1, qty: 1 }], customer: { ...customer, city: '' } });
    expect(res.status).toBe(400);
  });

  it('400 si un producto del carrito no existe', async () => {
    mockConfig = { tables: { products: { data: [], error: null }, promotion_products: { data: [], error: null } } };
    const res = await call({ items: [{ product_id: 99, qty: 1 }], customer });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/no encontrado/i);
  });

  it('201 crea el pedido y calcula el total', async () => {
    mockConfig = {
      tables: {
        products: { data: [{ id: 1, name: 'Alimento', price: 1000, sale_price: null }], error: null },
        promotion_products: { data: [], error: null },
        customers: { data: null, error: null },
        orders: { data: { id: 123 }, error: null },
      },
    };
    const res = await call({ items: [{ product_id: 1, qty: 2 }], customer });
    expect(res.status).toBe(201);
    const { order } = await res.json();
    expect(order.id).toBe(123);
    expect(order.subtotal).toBe(2000);
    expect(order.total).toBe(2000);
  });

  it('aplica la promoción activa server-side', async () => {
    mockConfig = {
      tables: {
        products: { data: [{ id: 1, name: 'Alimento', price: 1000, sale_price: null }], error: null },
        promotion_products: { data: [{ product_id: 1, promotion_id: 5 }], error: null },
        promotions: {
          data: [{
            id: 5, discount_type: 'percent', discount_percent: 20, discount_fixed: null,
            is_active: true, valid_from: '2020-01-01T00:00:00Z', valid_until: null,
          }],
          error: null,
        },
        customers: { data: null, error: null },
        orders: { data: { id: 123 }, error: null },
      },
    };
    const res = await call({ items: [{ product_id: 1, qty: 1 }], customer });
    const { order } = await res.json();
    expect(order.subtotal).toBe(800); // 1000 - 20%
    expect(order.total).toBe(800);
  });

  it('aplica un cupón válido al total', async () => {
    mockConfig = {
      tables: {
        products: { data: [{ id: 1, name: 'Alimento', price: 1000, sale_price: null }], error: null },
        promotion_products: { data: [], error: null },
        coupons: { data: { id: 9, discount_percent: 10, max_uses: 100, uses_count: 0 }, error: null },
        customers: { data: null, error: null },
        orders: { data: { id: 123 }, error: null },
      },
      rpc: {
        increment_coupon_use: { data: null, error: null },
      },
    };
    const res = await call({ items: [{ product_id: 1, qty: 2 }], customer, couponCode: 'PROMO10' });
    const { order } = await res.json();
    expect(order.subtotal).toBe(2000);
    expect(order.couponDiscount).toBe(200);
    expect(order.total).toBe(1800);
  });

  it('400 con un cupón inválido', async () => {
    mockConfig = {
      tables: {
        products: { data: [{ id: 1, name: 'Alimento', price: 1000, sale_price: null }], error: null },
        promotion_products: { data: [], error: null },
        coupons: { data: null, error: { message: 'invalid' } },
      },
    };
    const res = await call({ items: [{ product_id: 1, qty: 1 }], customer, couponCode: 'NOPE' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/cupón inválido/i);
  });

  it('500 si la inserción de pedido falla', async () => {
    mockConfig = {
      tables: {
        products: { data: [{ id: 1, name: 'Alimento', price: 1000, sale_price: null }], error: null },
        promotion_products: { data: [], error: null },
        customers: { data: null, error: null },
        orders: { data: null, error: { message: 'boom' } },
      },
    };
    expect((await call({ items: [{ product_id: 1, qty: 1 }], customer })).status).toBe(500);
  });
});
