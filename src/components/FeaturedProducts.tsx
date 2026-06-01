'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Home, Link2, Radio, UtensilsCrossed, Droplets, Gamepad2, Wind, Shirt, Backpack } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import ProductCard from '@/components/ProductCard';
import type { Product, Category } from '@/types';

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-full bg-gray-100 rounded animate-pulse mt-3" />
      </div>
    </div>
  );
}

const categoryIconMap: Record<string, any> = {
  'camas-y-cuchas': Home,
  'collares-y-correas': Link2,
  'collares-correas-y-arneses': Radio,
  'comederos-y-bebederos': UtensilsCrossed,
  'higiene-y-cuidado': Droplets,
  'juguetes': Gamepad2,
  'rascadores-y-areneros': Wind,
  'ropa-y-abrigos': Shirt,
  'transporte-y-paseo': Backpack,
};

const defaultIcons = [Home, Link2, Radio, UtensilsCrossed, Droplets];

function getCategoryIcon(slug: string) {
  return categoryIconMap[slug] || defaultIcons[Object.keys(categoryIconMap).length % defaultIcons.length];
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase.from('categories').select('*').order('name'),
    ]).then(([productsRes, categoriesRes]) => {
      setProducts((productsRes.data as Product[]) || []);
      setCategories((categoriesRes.data as Category[]) || []);
      setLoading(false);
    });
  }, []);

  return (
    <>
      {/* Categorías */}
      {(loading || categories.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 font-logo">
              Categorías
            </h2>
            <p className="text-gray-500">Encontrá justo lo que tu mascota necesita</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                return (
                  <Link
                    key={cat.id}
                    href={`/productos?categoria=${cat.slug}`}
                    className="group bg-white border-2 border-gray-100 rounded-2xl p-5 text-center hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-11 h-11 bg-brand-100 group-hover:bg-brand-200 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                      <Icon className="w-5 h-5 text-brand-700" />
                    </div>
                    <span className="text-sm font-bold text-gray-800 group-hover:text-brand-700 transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Destacados */}
      {(loading || products.length > 0) && (
        <section className="bg-brand-50/40 border-y border-brand-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-logo">
                  Destacados
                </h2>
                <p className="text-gray-500 mt-1">Los favoritos de nuestros clientes</p>
              </div>
              <Link
                href="/productos"
                className="hidden sm:inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 font-bold"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}

            <div className="sm:hidden text-center mt-8">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-brand-700 font-bold"
              >
                Ver todos los productos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
