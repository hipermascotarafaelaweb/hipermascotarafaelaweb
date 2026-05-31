'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ProductGrid from './ProductGrid';
import type { Product, Category } from '@/types';

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="aspect-square bg-gray-100 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-full bg-gray-100 rounded animate-pulse mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductosClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('categoria') || 'all';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]).then(([productsRes, categoriesRes]) => {
      setProducts((productsRes.data as Product[]) || []);
      setCategories((categoriesRes.data as Category[]) || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <GridSkeleton />;

  return (
    <ProductGrid
      products={products}
      categories={categories}
      initialCategory={initialCategory}
    />
  );
}
