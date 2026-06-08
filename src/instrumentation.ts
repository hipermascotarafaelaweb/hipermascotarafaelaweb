import * as Sentry from '@sentry/nextjs';

/**
 * Inicialización de Sentry del lado del servidor (runtimes nodejs y edge).
 * Complementa a `sentry.client.config.ts` (browser). Gateado por DSN: si no hay
 * `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`, no inicializa (igual que el cliente).
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  if (
    process.env.NEXT_RUNTIME === 'nodejs' ||
    process.env.NEXT_RUNTIME === 'edge'
  ) {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_ENV || 'production',
      tracesSampleRate: 0.1,
    });
  }
}

// Captura errores no controlados de Server Components y rutas API (Next 15+).
export const onRequestError = Sentry.captureRequestError;
