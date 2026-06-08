import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cart';
import type { Product } from '@/types';

function makeProduct(over: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Alimento Premium 15kg',
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

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('agrega un producto nuevo', () => {
    useCartStore.getState().addItem(makeProduct(), 2);
    expect(useCartStore.getState().totalItems()).toBe(2);
  });

  it('acumula cantidad del mismo producto', () => {
    const p = makeProduct();
    useCartStore.getState().addItem(p, 1);
    useCartStore.getState().addItem(p, 3);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().totalItems()).toBe(4);
  });

  it('limita la cantidad al stock disponible', () => {
    const p = makeProduct({ stock: 5 });
    useCartStore.getState().addItem(p, 99);
    expect(useCartStore.getState().totalItems()).toBe(5);
  });

  it('updateQuantity a 0 elimina el item', () => {
    const p = makeProduct();
    useCartStore.getState().addItem(p, 2);
    useCartStore.getState().updateQuantity(p.id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removeItem quita solo el producto indicado', () => {
    useCartStore.getState().addItem(makeProduct({ id: 1 }), 1);
    useCartStore.getState().addItem(makeProduct({ id: 2 }), 1);
    useCartStore.getState().removeItem(1);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe(2);
  });

  it('totalPrice usa el precio efectivo (oferta) cuando aplica', () => {
    useCartStore.getState().addItem(makeProduct({ price: 1000, sale_price: 800 }), 2);
    expect(useCartStore.getState().totalPrice()).toBe(1600);
  });

  it('clearCart vacía todo', () => {
    useCartStore.getState().addItem(makeProduct(), 3);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
