import { createClient } from '@/utils/supabase/server';
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Productos</h1>
      <AdminProductsTable
        initialProducts={(products as Product[]) || []}
        categories={(categories as Category[]) || []}
      />
    </div>
  );
}
