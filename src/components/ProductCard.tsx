'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, PawPrint, Check, Star, Tag } from 'lucide-react';
import { useState } from 'react';
import type { Product, Promotion } from '@/types';
import { useCartStore } from '@/store/cart';
import { formatPrice, hasDiscount, effectivePrice, discountPercent } from '@/utils/format';
import { cn } from '@/utils/cn';
import PromotionBadge from './PromotionBadge';
import { isPromotionActive } from '@/utils/promotions';

export default function ProductCard({ product, promotion, index = 0 }: { product: Product; promotion?: Promotion; index?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const onSale = hasDiscount(product);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <Link href={`/producto?id=${product.id}`} className="relative aspect-square bg-brand-50/50 overflow-hidden block">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-200">
            <PawPrint className="w-16 h-16" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {promotion && isPromotionActive(promotion) && !outOfStock && (
            <div className="inline-block">
              <PromotionBadge promotion={promotion} />
            </div>
          )}
          {onSale && !outOfStock && !promotion && (
            <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm inline-flex items-center gap-1">
              <Tag className="w-3 h-3 fill-current" /> -{discountPercent(product)}%
            </span>
          )}
          {product.is_featured && !outOfStock && (
            <span className="bg-brand-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm inline-flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Destacado
            </span>
          )}
          {lowStock && (
            <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              ¡Últimas {product.stock}!
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-900 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
              Sin stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-[11px] text-brand-600 font-bold uppercase tracking-wider mb-1">
            {product.category.name}
          </span>
        )}
        <Link href={`/producto?id=${product.id}`} className="font-bold text-gray-900 leading-snug line-clamp-2 mb-1 hover:text-brand-700 transition-colors">
          {product.name}
        </Link>
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="mb-2.5">
            {onSale && (
              <span className="block text-xs text-gray-500 line-through leading-none">
                {formatPrice(product.price)}
              </span>
            )}
            <span className={cn('block text-lg sm:text-xl font-extrabold', onSale ? 'text-red-600' : 'text-gray-900')}>
              {formatPrice(effectivePrice(product))}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock || added}
            className={cn(
              'w-full flex items-center justify-center gap-1.5 text-white text-sm font-bold px-3 py-2.5 rounded-xl transition-all duration-300',
              added
                ? 'bg-brand-500'
                : outOfStock
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 active:scale-95 shadow-sm shadow-brand-600/20'
            )}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Sumado al pedido
              </>
            ) : outOfStock ? (
              'Sin stock'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
