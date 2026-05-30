import { createClient } from '@/utils/supabase/server';
import { Package, DollarSign, AlertTriangle } from 'lucide-react';
import type { Product, Category } from '@/types';
import AdminProductsTable from './AdminProductsTable';

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ]);

  const allProducts = (products as Product[]) || [];
  const totalProducts = allProducts.length;
  const lowStock = allProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = allProducts.filter((p) => p.stock <= 0).length;

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
        initialProducts={allProducts}
        categories={(categories as Category[]) || []}
      />
    </div>
  );
}
