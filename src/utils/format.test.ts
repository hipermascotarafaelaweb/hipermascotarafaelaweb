import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  hasDiscount,
  effectivePrice,
  discountPercent,
} from './format';

describe('formatPrice', () => {
  it('formatea con separador de miles argentino y sin decimales', () => {
    expect(formatPrice(1500)).toBe('$1.500');
    expect(formatPrice(0)).toBe('$0');
    expect(formatPrice(1234567)).toBe('$1.234.567');
  });

  it('redondea cualquier parte decimal', () => {
    expect(formatPrice(1999.99)).toBe('$2.000');
  });
});

describe('hasDiscount', () => {
  it('true solo cuando sale_price es válido y menor al precio', () => {
    expect(hasDiscount({ price: 1000, sale_price: 800 })).toBe(true);
  });

  it('false cuando sale_price es null, 0, igual o mayor', () => {
    expect(hasDiscount({ price: 1000, sale_price: null })).toBe(false);
    expect(hasDiscount({ price: 1000, sale_price: 0 })).toBe(false);
    expect(hasDiscount({ price: 1000, sale_price: 1000 })).toBe(false);
    expect(hasDiscount({ price: 1000, sale_price: 1200 })).toBe(false);
  });
});

describe('effectivePrice', () => {
  it('devuelve el precio de oferta si aplica', () => {
    expect(effectivePrice({ price: 1000, sale_price: 800 })).toBe(800);
  });

  it('devuelve el precio normal si no hay oferta válida', () => {
    expect(effectivePrice({ price: 1000, sale_price: null })).toBe(1000);
    expect(effectivePrice({ price: 1000, sale_price: 1500 })).toBe(1000);
  });
});

describe('discountPercent', () => {
  it('calcula el porcentaje redondeado', () => {
    expect(discountPercent({ price: 1000, sale_price: 800 })).toBe(20);
    expect(discountPercent({ price: 1000, sale_price: 750 })).toBe(25);
  });

  it('redondea correctamente porcentajes no exactos', () => {
    expect(discountPercent({ price: 999, sale_price: 666 })).toBe(33);
  });

  it('0 si no hay oferta', () => {
    expect(discountPercent({ price: 1000, sale_price: null })).toBe(0);
  });
});
