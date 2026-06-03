import { createClient } from '@supabase/supabase-js';
import ProductGrid from './ProductGrid';
import type { Product, Category, Promotion, PromotionProduct } from '@/types';

interface ProductosClientProps {
  initialCategory?: string;
}

export default async function ProductosClient({ initialCategory = 'all' }: ProductosClientProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date().toISOString();

  const [productsRes, categoriesRes, promotionsRes, promotionProductsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .or(`valid_until.is.null,valid_until.gt.${now}`),
    supabase
      .from('promotion_products')
      .select('*'),
  ]);

  const products = (productsRes.data as Product[]) || [];
  const categories = (categoriesRes.data as Category[]) || [];
  const promotions = (promotionsRes.data as Promotion[]) || [];
  const promotionProducts = (promotionProductsRes.data as PromotionProduct[]) || [];

  const promotionsByProductId = new Map<number, Promotion>();
  promotionProducts.forEach(pp => {
    const promotion = promotions.find(p => p.id === pp.promotion_id);
    if (promotion) {
      promotionsByProductId.set(pp.product_id, promotion);
    }
  });

  return (
    <ProductGrid
      products={products}
      categories={categories}
      initialCategory={initialCategory}
      promotionsByProductId={promotionsByProductId}
    />
  );
}
