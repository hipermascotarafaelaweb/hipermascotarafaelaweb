'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/utils/format';

/** Barra fija inferior (solo mobile) para abrir el pedido rápido. */
export default function MobileCartBar({ onOpen }: { onOpen: () => void }) {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalPrice = useCartStore((s) => s.totalPrice);

  useEffect(() => setMounted(true), []);

  if (!mounted || items.length === 0) return null;

  const count = totalItems();

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-900/20 pl-4 pr-3 py-3 active:scale-[0.99] transition-transform"
      >
        <span className="relative">
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-white text-brand-700 text-[11px] font-extrabold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
            {count}
          </span>
        </span>
        <span className="flex-1 text-left">
          <span className="block text-[11px] text-brand-100 leading-none">Tu pedido</span>
          <span className="block font-extrabold leading-tight">{formatPrice(totalPrice())}</span>
        </span>
        <span className="flex items-center gap-1 bg-white/15 rounded-xl px-3 py-2 font-bold text-sm">
          Ver pedido
          <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
}
