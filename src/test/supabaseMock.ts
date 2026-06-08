import { vi } from 'vitest';

/**
 * Mock mínimo y configurable del cliente de Supabase para tests de rutas API.
 * El query builder de supabase-js es encadenable y "thenable" (await dispara
 * la consulta). Acá cada método de cadena devuelve el mismo builder, y `await`
 * resuelve al resultado configurado por tabla / rpc.
 */
export interface QueryResult<T = unknown> {
  data: T;
  error: unknown;
}

function makeBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const m of [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'is', 'or',
    'order', 'limit', 'range', 'single', 'maybeSingle',
  ]) {
    builder[m] = chain;
  }
  // Thenable: await builder → result
  builder.then = (resolve: (v: QueryResult) => unknown) => resolve(result);
  return builder;
}

export interface SupabaseMockConfig {
  tables?: Record<string, QueryResult>;
  rpc?: Record<string, QueryResult>;
  /** Resultado de auth.getUser() — { data: { user }, error }. */
  auth?: { data: { user: unknown }; error: unknown };
}

export function makeSupabaseClient(config: SupabaseMockConfig = {}) {
  const empty: QueryResult = { data: null, error: null };
  return {
    from: vi.fn((table: string) => makeBuilder(config.tables?.[table] ?? empty)),
    rpc: vi.fn((name: string) => makeBuilder(config.rpc?.[name] ?? empty)),
    auth: {
      getUser: vi.fn(async () => config.auth ?? { data: { user: null }, error: null }),
    },
  };
}

/** Construye un Request con body JSON para pasar a los handlers de ruta. */
export function jsonRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}
