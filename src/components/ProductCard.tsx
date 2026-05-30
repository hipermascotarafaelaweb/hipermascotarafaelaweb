'use client';

import Image from 'next/image';
import { ShoppingCart, PackageX, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cart';

function formatPrice(price: number): string {
  return price.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <PackageX className="w-16 h-16" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
              Sin stock
            </span>
          </div>
        )}
        {product.is_featured && !outOfStock && (
          <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Destacado
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">
            {product.category.name}
          </span>
        )}
        <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xl font-extrabold text-gray-900">
            ${formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock || added}
            className={`flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 ${
              added
                ? 'bg-green-500 scale-95'
                : outOfStock
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Agregado
              </>
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
