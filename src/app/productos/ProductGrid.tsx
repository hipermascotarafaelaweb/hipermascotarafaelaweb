'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';

type SortOption = 'recent' | 'price_asc' | 'price_desc';

export default function ProductGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('recent');

  const filtered = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.category?.slug === selectedCategory
      );
    }

    switch (sort) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, sort]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-400'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="recent">Más recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No se encontraron productos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
