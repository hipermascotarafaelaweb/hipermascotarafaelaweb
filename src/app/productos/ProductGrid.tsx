'use client';

import { useState, useMemo } from 'react';
import { Search, PawPrint, Dog, Cat, PawPrint as PawIcon, SlidersHorizontal, X } from 'lucide-react';
import type { Product, Category, PetType, Promotion } from '@/types';
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
  promotionsByProductId = new Map(),
}: {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  promotionsByProductId?: Map<number, Promotion>;
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
  const [showFilters, setShowFilters] = useState(false);
  // Filtros avanzados (migración 0005). Solo se muestran si hay datos.
  const [size, setSize] = useState('');
  const [lifeStage, setLifeStage] = useState('');
  const [diet, setDiet] = useState('');

  const uniq = (vals: (string | null | undefined)[]) =>
    [...new Set(vals.filter((v): v is string => !!v))];
  const sizeOptions = useMemo(() => uniq(products.map((p) => p.size)), [products]);
  const lifeStageOptions = useMemo(() => uniq(products.map((p) => p.life_stage)), [products]);
  const dietOptions = useMemo(() => uniq(products.map((p) => p.diet)), [products]);

  const hasActiveFilters = pet !== 'all' || selectedCategory !== 'all' || minPrice || maxPrice || onSaleOnly || sort !== 'recent' || size || lifeStage || diet;

  const clearAllFilters = () => {
    setPet('all');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setOnSaleOnly(false);
    setSort('recent');
    setSize('');
    setLifeStage('');
    setDiet('');
  };

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

    if (size) result = result.filter((p) => p.size === size);
    if (lifeStage) result = result.filter((p) => p.life_stage === lifeStage);
    if (diet) result = result.filter((p) => p.diet === diet);

    if (sort === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [products, selectedCategory, pet, sort, search, minPrice, maxPrice, onSaleOnly, size, lifeStage, diet]);

  const filterLabel = (v: string) =>
    v.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div>
      {/* Search + Filter button */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all shrink-0',
            showFilters
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtrar</span>
          {hasActiveFilters && (
            <span className={cn(
              'w-2 h-2 rounded-full',
              showFilters ? 'bg-white' : 'bg-brand-600'
            )} />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-6 space-y-5 max-h-[70vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          {/* Mascota */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Mascota</label>
            <div className="flex gap-2">
              {petFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setPet(f.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                    pet === f.value
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-brand-400'
                  )}
                >
                  <f.icon className="w-4 h-4" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Categoría</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all',
                  selectedCategory === 'all'
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-brand-400'
                )}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all',
                    selectedCategory === cat.slug
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-brand-400'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Precio + Ordenar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Precio min</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Precio max</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ordenar por</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="recent">Más recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>
            </div>
          </div>

          {/* Filtros avanzados (aparecen solo si hay datos cargados) */}
          {(sizeOptions.length > 0 || lifeStageOptions.length > 0 || dietOptions.length > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="advanced-filters">
              {sizeOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tamaño</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Todos</option>
                    {sizeOptions.map((o) => (
                      <option key={o} value={o}>{filterLabel(o)}</option>
                    ))}
                  </select>
                </div>
              )}
              {lifeStageOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Edad</label>
                  <select
                    value={lifeStage}
                    onChange={(e) => setLifeStage(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Todas</option>
                    {lifeStageOptions.map((o) => (
                      <option key={o} value={o}>{filterLabel(o)}</option>
                    ))}
                  </select>
                </div>
              )}
              {dietOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Dieta</label>
                  <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Todas</option>
                    {dietOptions.map((o) => (
                      <option key={o} value={o}>{filterLabel(o)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Oferta + Limpiar */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600"
              />
              <span className="text-sm font-semibold text-gray-700">Solo ofertas</span>
            </label>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors font-semibold"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active filters summary (when panel is closed) */}
      {!showFilters && hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span>Filtros activos</span>
          <button
            onClick={clearAllFilters}
            className="text-brand-600 hover:text-red-600 font-semibold transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              promotion={promotionsByProductId?.get(product.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
