import { createClient } from '@/utils/supabase/server';
import type { Product, Category } from '@/types';
import ProductGrid from './ProductGrid';

export const revalidate = 60;

export const metadata = {
  title: 'Productos | Hipermascota Rafaela',
};

export default async function ProductosPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nuestros Productos</h1>
      <ProductGrid
        products={(products as Product[]) || []}
        categories={(categories as Category[]) || []}
      />
    </div>
  );
}
