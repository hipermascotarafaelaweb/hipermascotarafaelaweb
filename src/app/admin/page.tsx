'use client';

import { useEffect, useState } from 'react';
import { Package, AlertTriangle, XCircle, Star, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Product, Category } from '@/types';
import AdminProductsTable from './AdminProductsTable';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
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
  };

  useEffect(fetchData, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Productos', value: products.length, icon: Package, color: 'brand' },
    { label: 'Destacados', value: products.filter((p) => p.is_featured).length, icon: Star, color: 'amber' },
    { label: 'Stock bajo', value: products.filter((p) => p.stock > 0 && p.stock <= 5).length, icon: AlertTriangle, color: 'orange' },
    { label: 'Sin stock', value: products.filter((p) => p.stock <= 0).length, icon: XCircle, color: 'red' },
  ];

  const colorMap: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-700',
    amber: 'bg-amber-100 text-amber-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[s.color]}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 font-logo">Productos</h1>
      <AdminProductsTable
        initialProducts={products}
        categories={categories}
        onRefresh={fetchData}
      />
    </div>
  );
}
