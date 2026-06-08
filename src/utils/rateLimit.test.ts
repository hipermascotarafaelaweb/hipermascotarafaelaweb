import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRateLimited } from './rateLimit';

describe('isRateLimited — fallback en memoria', () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('permite hasta el límite y bloquea el siguiente', async () => {
    const key = `test:${Math.random()}`;
    const win = { limit: 3, windowMs: 60_000 };
    expect(await isRateLimited(key, win)).toBe(false);
    expect(await isRateLimited(key, win)).toBe(false);
    expect(await isRateLimited(key, win)).toBe(false);
    expect(await isRateLimited(key, win)).toBe(true);
  });

  it('claves distintas tienen contadores independientes', async () => {
    const win = { limit: 1, windowMs: 60_000 };
    expect(await isRateLimited(`a:${Math.random()}`, win)).toBe(false);
    expect(await isRateLimited(`b:${Math.random()}`, win)).toBe(false);
  });

  it('la ventana expira con el tiempo', async () => {
    vi.useFakeTimers();
    const key = `expire:${Math.random()}`;
    const win = { limit: 1, windowMs: 1000 };
    expect(await isRateLimited(key, win)).toBe(false);
    expect(await isRateLimited(key, win)).toBe(true);
    vi.advanceTimersByTime(1500);
    expect(await isRateLimited(key, win)).toBe(false);
    vi.useRealTimers();
  });
});

describe('isRateLimited — camino Upstash Redis', () => {
  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
  });
  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('bloquea cuando el contador supera el límite', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ result: 6 }, { result: 1 }]), { status: 200 })
    );
    expect(await isRateLimited('k', { limit: 5, windowMs: 60_000 })).toBe(true);
  });

  it('permite cuando el contador está dentro del límite', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ result: 2 }, { result: 1 }]), { status: 200 })
    );
    expect(await isRateLimited('k', { limit: 5, windowMs: 60_000 })).toBe(false);
  });

  it('degrada a memoria si Upstash falla', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network'));
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    // No lanza, cae al contador en memoria => primer hit permitido
    expect(await isRateLimited(`fb:${Math.random()}`, { limit: 1, windowMs: 60_000 })).toBe(false);
    expect(consoleErr).toHaveBeenCalled();
  });
});
