import { createClient } from '@supabase/supabase-js';
import ProductGrid from './ProductGrid';
import type { Product, Category } from '@/types';

interface ProductosClientProps {
  initialCategory?: string;
}

export default async function ProductosClient({ initialCategory = 'all' }: ProductosClientProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ]);

  const products = (productsRes.data as Product[]) || [];
  const categories = (categoriesRes.data as Category[]) || [];

  return (
    <ProductGrid
      products={products}
      categories={categories}
      initialCategory={initialCategory}
    />
  );
}
