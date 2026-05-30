'use client';

import { useEffect, useState } from 'react';
import { Package, AlertTriangle, DollarSign, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{totalProducts}</p>
            <p className="text-sm text-gray-500">Productos</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{lowStock}</p>
            <p className="text-sm text-gray-500">Stock bajo</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{outOfStock}</p>
            <p className="text-sm text-gray-500">Sin stock</p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Gestión de Productos</h1>
      <AdminProductsTable
        initialProducts={products}
        categories={categories}
        onRefresh={fetchData}
      />
    </div>
  );
}
