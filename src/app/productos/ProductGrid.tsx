'use client';

import { useState, useMemo } from 'react';
import { Search, PawPrint } from 'lucide-react';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/utils/cn';

type SortOption = 'recent' | 'price_asc' | 'price_desc';

export default function ProductGrid({
  products,
  categories,
  initialCategory = 'all',
}: {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}) {
  const validInitial = categories.some((c) => c.slug === initialCategory)
    ? initialCategory
    : 'all';
  const [selectedCategory, setSelectedCategory] = useState<string>(validInitial);
  const [sort, setSort] = useState<SortOption>('recent');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = products;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    if (sort === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [products, selectedCategory, sort, search]);

  return (
    <div>
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold transition-all',
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-400'
            )}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition-all',
                selectedCategory === cat.slug
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-400'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shrink-0"
        >
          <option value="recent">Más recientes</option>
          <option value="price_asc">Menor precio</option>
          <option value="price_desc">Mayor precio</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <PawPrint className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-lg text-gray-400 font-semibold">No encontramos productos</p>
          <p className="text-sm text-gray-400 mt-1">Probá con otra categoría o búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
