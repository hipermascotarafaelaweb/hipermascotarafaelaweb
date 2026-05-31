'use client';

import { useState, useMemo } from 'react';
import { Search, PawPrint, Dog, Cat, PawPrint as PawIcon, ChevronDown } from 'lucide-react';
import type { Product, Category, PetType } from '@/types';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/utils/cn';

type SortOption = 'recent' | 'price_asc' | 'price_desc';
type PetFilter = 'all' | 'perro' | 'gato';

const petFilters: { value: PetFilter; label: string; icon: typeof Dog }[] = [
  { value: 'all', label: 'Todas', icon: PawIcon },
  { value: 'perro', label: 'Perros', icon: Dog },
  { value: 'gato', label: 'Gatos', icon: Cat },
];

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
  const [pet, setPet] = useState<PetFilter>('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

    if (pet !== 'all') {
      result = result.filter((p) => {
        const t: PetType = p.pet_type ?? 'ambos';
        return t === pet || t === 'ambos';
      });
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    if (onSaleOnly) {
      result = result.filter((p) => p.sale_price && p.sale_price > 0 && p.sale_price < p.price);
    }

    if (sort === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [products, selectedCategory, pet, sort, search, minPrice, maxPrice, onSaleOnly]);

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

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {petFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setPet(f.value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all',
              pet === f.value
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
            )}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:border-brand-400 transition-all"
        >
          <span>Filtros avanzados</span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', showAdvanced && 'rotate-180')} />
        </button>
      </div>

      {showAdvanced && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio mínimo</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio máximo</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={onSaleOnly}
              onChange={(e) => setOnSaleOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-600"
            />
            <span className="text-sm font-semibold text-gray-700">Solo productos en oferta</span>
          </label>
          {(minPrice || maxPrice || onSaleOnly) && (
            <button
              onClick={() => {
                setMinPrice('');
                setMaxPrice('');
                setOnSaleOnly(false);
              }}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Limpiar filtros avanzados
            </button>
          )}
        </div>
      )}

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
