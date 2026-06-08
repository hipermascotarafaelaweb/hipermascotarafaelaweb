// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeSupabaseClient, type SupabaseMockConfig } from '@/test/supabaseMock';

let mockConfig: SupabaseMockConfig = {};
vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => makeSupabaseClient(mockConfig),
}));

import { GET } from './route';

const admin = {
  auth: { data: { user: { id: 'a' } }, error: null },
  rpc: { is_admin: { data: true, error: null } },
};

describe('GET /api/admin/inventory/alerts', () => {
  beforeEach(() => { mockConfig = {}; });

  it('401 sin usuario', async () => {
    mockConfig = { auth: { data: { user: null }, error: null } };
    expect((await GET()).status).toBe(401);
  });

  it('403 si no es admin', async () => {
    mockConfig = {
      auth: { data: { user: { id: 'u' } }, error: null },
      rpc: { is_admin: { data: false, error: null } },
    };
    expect((await GET()).status).toBe(403);
  });

  it('devuelve solo productos bajo umbral, con reposición sugerida y orden por venta', async () => {
    mockConfig = {
      ...admin,
      tables: {
        products: {
          data: [
            { id: 1, name: 'Bajo y vende', stock: 2, low_stock_threshold: 5 },
            { id: 2, name: 'Con stock', stock: 50, low_stock_threshold: 5 },
            { id: 3, name: 'Bajo y vende mucho', stock: 1, low_stock_threshold: 5 },
          ],
          error: null,
        },
        product_sales_velocity: {
          data: [
            { product_id: 1, sold_30d: 10 },
            { product_id: 3, sold_30d: 40 },
          ],
          error: null,
        },
      },
    };
    const res = await GET();
    expect(res.status).toBe(200);
    const { alerts } = await res.json();
    expect(alerts).toHaveLength(2); // el producto 2 queda fuera (stock alto)
    expect(alerts[0].id).toBe(3); // ordenado por velocidad desc
    expect(alerts[0].suggested).toBe(39); // 40 vendidos - 1 en stock
    expect(alerts[1].suggested).toBe(8); // 10 - 2
  });

  it('umbral por defecto 5 si la columna es null', async () => {
    mockConfig = {
      ...admin,
      tables: {
        products: { data: [{ id: 1, name: 'X', stock: 4, low_stock_threshold: null }], error: null },
        product_sales_velocity: { data: [], error: null },
      },
    };
    const { alerts } = await (await GET()).json();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].threshold).toBe(5);
  });
});
