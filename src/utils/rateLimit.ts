/**
 * Rate limiter compartido para las rutas de API.
 *
 * Si están definidas las env vars UPSTASH_REDIS_REST_URL y
 * UPSTASH_REDIS_REST_TOKEN, usa Upstash Redis (REST) como contador de ventana
 * fija: así el límite es DURO y compartido entre todas las instancias
 * serverless de Vercel. Si no están, cae a un contador en memoria por instancia
 * (mejor que nada, pero se resetea por cold start y no es compartido).
 *
 * No agrega dependencias: habla con Upstash por su API REST con fetch.
 * Para activarlo: crear un Redis en Upstash (o desde el marketplace de Vercel)
 * y setear esas dos variables en el proyecto de Vercel.
 */

export interface RateLimitWindow {
  /** Cantidad máxima de solicitudes permitidas dentro de la ventana. */
  limit: number;
  /** Tamaño de la ventana en milisegundos. */
  windowMs: number;
}

const memory = new Map<string, number[]>();

function memoryLimited(key: string, { limit, windowMs }: RateLimitWindow): boolean {
  const now = Date.now();
  const recent = (memory.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) return true;
  recent.push(now);
  memory.set(key, recent);
  // Cota de memoria: descarta la entrada más vieja si crece demasiado.
  if (memory.size > 1000) {
    const oldest = memory.keys().next().value;
    if (oldest !== undefined) memory.delete(oldest);
  }
  return false;
}

async function redisLimited(
  url: string,
  token: string,
  key: string,
  { limit, windowMs }: RateLimitWindow
): Promise<boolean> {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  // Pipeline: INCR del contador y EXPIRE solo si aún no tiene TTL (NX),
  // anclando la ventana al primer hit.
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, windowSec, 'NX'],
    ]),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Upstash respondió ${res.status}`);
  const data = (await res.json()) as Array<{ result?: number }>;
  const count = Number(data?.[0]?.result ?? 0);
  return count > limit;
}

/**
 * Devuelve true si la `key` superó el límite dentro de la ventana.
 * Nunca lanza: ante un fallo de Upstash, degrada al contador en memoria.
 */
export async function isRateLimited(
  key: string,
  window: RateLimitWindow
): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await redisLimited(url, token, key, window);
    } catch (err) {
      console.error('Rate limit (Upstash) falló, usando memoria:', err);
    }
  }
  return memoryLimited(key, window);
}
