// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeSupabaseClient, jsonRequest, type SupabaseMockConfig } from '@/test/supabaseMock';

let mockConfig: SupabaseMockConfig = {};
let mockLimited = false;
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => makeSupabaseClient(mockConfig),
}));
vi.mock('@/utils/rateLimit', () => ({
  isRateLimited: async () => mockLimited,
}));

import { POST } from './route';

const call = (body: unknown) => POST(jsonRequest(body));

describe('POST /api/customers/by-dni', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
    mockConfig = {};
    mockLimited = false;
  });

  it('400 si falta el DNI', async () => {
    expect((await call({})).status).toBe(400);
  });

  it('400 si el DNI es inválido (pocos dígitos)', async () => {
    const res = await call({ dni: '123' });
    expect(res.status).toBe(400);
  });

  it('429 cuando se supera el rate limit', async () => {
    mockLimited = true;
    const res = await call({ dni: '30123456' });
    expect(res.status).toBe(429);
  });

  it('200 con customer null si no existe (PGRST116)', async () => {
    mockConfig = { tables: { customers: { data: null, error: { code: 'PGRST116' } } } };
    const res = await call({ dni: '30123456' });
    expect(res.status).toBe(200);
    expect((await res.json()).customer).toBeNull();
  });

  it('200 con datos del cliente y dirección parseada', async () => {
    mockConfig = {
      tables: {
        customers: {
          data: {
            first_name: 'Juan', last_name: 'Pérez', dni: '30123456', phone: '3492111222',
            address: 'San Martín 100, Rafaela, Santa Fe 2300',
          },
          error: null,
        },
      },
    };
    const res = await call({ dni: '30.123.456' }); // limpia puntos
    expect(res.status).toBe(200);
    const { customer } = await res.json();
    expect(customer.first_name).toBe('Juan');
    expect(customer.street).toBe('San Martín 100');
    expect(customer.city).toBe('Rafaela');
    expect(customer.province).toBe('Santa Fe');
    expect(customer.postal_code).toBe('2300');
  });

  it('500 ante un error inesperado de la base', async () => {
    mockConfig = { tables: { customers: { data: null, error: { code: 'OTHER', message: 'boom' } } } };
    const res = await call({ dni: '30123456' });
    expect(res.status).toBe(500);
  });
});
