import Link from 'next/link';
import { ArrowRight, Home, Link2, Radio, UtensilsCrossed, Droplets, Gamepad2, Wind, Shirt, Backpack } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProductCard from '@/components/ProductCard';
import type { Product, Category, Promotion, PromotionProduct } from '@/types';
import { applyPromotionToProduct } from '@/utils/promotions';

const categoryIconMap: Record<string, LucideIcon> = {
  'camas-y-cuchas': Home,
  'collares-y-correas': Link2,
  'collares-correas-y-arneses': Radio,
  'collares-correas-arneses': Radio,
  'comederos-y-bebederos': UtensilsCrossed,
  'higiene-y-cuidado': Droplets,
  'juguetes': Gamepad2,
  'rascadores-y-areneros': Wind,
  'ropa-y-abrigos': Shirt,
  'transporte-y-paseo': Backpack,
};

function getCategoryIcon(slug: string) {
  return categoryIconMap[slug] || Home;
}

const fetchData = cache(async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date().toISOString();

  const [productsRes, categoriesRes, promotionsRes, promotionProductsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*), price_tiers:product_price_tiers(id, product_id, min_qty, price)')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8),
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

  const promotions = (promotionsRes.data as Promotion[]) || [];
  const promotionProducts = (promotionProductsRes.data as PromotionProduct[]) || [];

  const promotionsByProductId = new Map<number, Promotion>();
  promotionProducts.forEach(pp => {
    const promotion = promotions.find(p => p.id === pp.promotion_id);
    if (promotion) {
      promotionsByProductId.set(pp.product_id, promotion);
    }
  });

  const rawProducts = (productsRes.data as Product[]) || [];
  const products = rawProducts.map(p =>
    applyPromotionToProduct(p, promotionsByProductId.get(p.id))
  );

  return {
    products,
    categories: (categoriesRes.data as Category[]) || [],
    promotionsByProductId,
  };
});

export default async function FeaturedProducts() {
  const { products, categories, promotionsByProductId } = await fetchData();

  return (
    <>
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 font-logo">
              Categorías
            </h2>
            <p className="text-gray-500">Encontrá justo lo que tu mascota necesita</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className="group bg-white border-2 border-gray-100 rounded-2xl p-5 text-center hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-11 h-11 bg-brand-100 group-hover:bg-brand-200 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                    <Icon className="w-5 h-5 text-brand-700" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 group-hover:text-brand-700 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="bg-brand-50/40 border-y border-brand-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-logo">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  promotion={promotionsByProductId.get(product.id)}
                  index={i}
                />
              ))}
            </div>

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
