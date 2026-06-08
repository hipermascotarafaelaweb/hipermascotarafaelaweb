import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isPromotionActive,
  applyPromotionDiscount,
  getDiscountAmount,
  formatDiscount,
  applyPromotionToProduct,
} from './promotions';
import type { Promotion, Product } from '@/types';

function makePromotion(over: Partial<Promotion> = {}): Promotion {
  return {
    id: 1,
    title: 'Promo',
    description: null,
    discount_percent: 20,
    discount_fixed: null,
    discount_type: 'percent',
    image_url: null,
    badge_label: null,
    display_priority: null,
    is_active: true,
    valid_from: '2020-01-01T00:00:00Z',
    valid_until: null,
    created_at: '2020-01-01T00:00:00Z',
    ...over,
  };
}

function makeProduct(over: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Alimento Premium',
    description: null,
    price: 1000,
    sale_price: null,
    category_id: null,
    image_url: null,
    images: null,
    pet_type: 'perro',
    stock: 10,
    is_featured: false,
    created_at: '2020-01-01T00:00:00Z',
    ...over,
  };
}

describe('isPromotionActive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-08T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('activa cuando is_active y dentro de la ventana', () => {
    expect(isPromotionActive(makePromotion())).toBe(true);
  });

  it('inactiva cuando is_active es false', () => {
    expect(isPromotionActive(makePromotion({ is_active: false }))).toBe(false);
  });

  it('inactiva cuando valid_from es futuro', () => {
    expect(
      isPromotionActive(makePromotion({ valid_from: '2030-01-01T00:00:00Z' }))
    ).toBe(false);
  });

  it('inactiva cuando valid_until ya pasó', () => {
    expect(
      isPromotionActive(makePromotion({ valid_until: '2021-01-01T00:00:00Z' }))
    ).toBe(false);
  });

  it('activa cuando valid_until es futuro', () => {
    expect(
      isPromotionActive(makePromotion({ valid_until: '2030-01-01T00:00:00Z' }))
    ).toBe(true);
  });
});

describe('applyPromotionDiscount', () => {
  it('aplica porcentaje', () => {
    expect(applyPromotionDiscount(1000, makePromotion({ discount_percent: 20 }))).toBe(800);
  });

  it('aplica monto fijo sin bajar de 0', () => {
    const promo = makePromotion({ discount_type: 'fixed', discount_fixed: 300, discount_percent: null });
    expect(applyPromotionDiscount(1000, promo)).toBe(700);
    expect(applyPromotionDiscount(200, promo)).toBe(0);
  });

  it('devuelve el precio original si el tipo no matchea', () => {
    const promo = makePromotion({ discount_type: 'percent', discount_percent: null });
    expect(applyPromotionDiscount(1000, promo)).toBe(1000);
  });
});

describe('getDiscountAmount', () => {
  it('monto ahorrado por porcentaje', () => {
    expect(getDiscountAmount(1000, makePromotion({ discount_percent: 20 }))).toBe(200);
  });

  it('monto fijo nunca mayor al precio', () => {
    const promo = makePromotion({ discount_type: 'fixed', discount_fixed: 5000, discount_percent: null });
    expect(getDiscountAmount(1000, promo)).toBe(1000);
  });
});

describe('formatDiscount', () => {
  it('porcentaje', () => {
    expect(formatDiscount(makePromotion({ discount_percent: 15 }))).toBe('-15%');
  });
  it('fijo', () => {
    expect(
      formatDiscount(makePromotion({ discount_type: 'fixed', discount_fixed: 250, discount_percent: null }))
    ).toBe('$250');
  });
});

describe('applyPromotionToProduct', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-08T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('sin promoción devuelve el producto intacto', () => {
    const p = makeProduct();
    expect(applyPromotionToProduct(p, null)).toBe(p);
  });

  it('con promoción inactiva devuelve intacto', () => {
    const p = makeProduct();
    expect(applyPromotionToProduct(p, makePromotion({ is_active: false }))).toBe(p);
  });

  it('aplica el descuento como sale_price cuando conviene', () => {
    const p = makeProduct({ price: 1000 });
    const result = applyPromotionToProduct(p, makePromotion({ discount_percent: 20 }));
    expect(result.sale_price).toBe(800);
  });

  it('no empeora una oferta ya mejor existente', () => {
    const p = makeProduct({ price: 1000, sale_price: 500 });
    const result = applyPromotionToProduct(p, makePromotion({ discount_percent: 20 }));
    // promo daría 800, pero ya tenía 500 => mantiene el producto sin cambios
    expect(result.sale_price).toBe(500);
  });
});
