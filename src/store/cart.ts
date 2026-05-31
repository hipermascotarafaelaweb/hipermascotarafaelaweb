'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { effectivePrice } from '@/utils/format';

// Carrito local + syncronización opcional con Supabase para multi-device
let syncTimer: NodeJS.Timeout | null = null;

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

/** Limita la cantidad al stock disponible del producto. */
function capToStock(product: Product, qty: number): number {
  const max = product.stock > 0 ? product.stock : 0;
  return Math.min(Math.max(qty, 1), max);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, qty = 1) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          const next = capToStock(product, existing.quantity + qty);
          set({
            items: get().items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: next } : i
            ),
          });
        } else {
          set({
            items: [...get().items, { product, quantity: capToStock(product, qty) }],
          });
        }
      },

      removeItem: (productId: number) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: capToStock(i.product, quantity) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + effectivePrice(i.product) * i.quantity, 0),
    }),
    { name: 'hipermascota-cart' }
  )
);
