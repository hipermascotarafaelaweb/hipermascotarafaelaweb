'use client';

import Image from 'next/image';
import { ShoppingCart, PackageX } from 'lucide-react';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cart';

function formatPrice(price: number): string {
  return price.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <PackageX className="w-16 h-16" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
              Sin stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-xs text-amber-600 font-medium mb-1">
            {product.category.name}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-gray-900">
            ${formatPrice(product.price)}
          </span>
          <button
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
