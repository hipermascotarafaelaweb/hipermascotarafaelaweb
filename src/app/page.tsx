import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, MessageCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const products = (featuredProducts as Product[]) || [];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Todo para tu <span className="text-amber-600">mascota</span> en un solo lugar
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Explorá nuestro catálogo de accesorios, armá tu pedido y confirmalo directamente por WhatsApp. ¡Sin complicaciones!
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors"
          >
            Ver Productos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Categorías */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Categorías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat: { id: number; name: string; slug: string }) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-amber-400 hover:shadow-md transition-all"
              >
                <span className="text-lg font-semibold text-gray-800">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Productos Destacados
            </h2>
            <Link
              href="/productos"
              className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 text-sm"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Beneficios */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <Truck className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="font-semibold text-gray-900">Envíos a Rafaela</h3>
              <p className="text-sm text-gray-500">
                Coordinamos la entrega directamente con vos.
              </p>
            </div>
            <div className="space-y-3">
              <ShieldCheck className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="font-semibold text-gray-900">Productos de Calidad</h3>
              <p className="text-sm text-gray-500">
                Accesorios resistentes y seguros para tu mascota.
              </p>
            </div>
            <div className="space-y-3">
              <MessageCircle className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="font-semibold text-gray-900">Atención por WhatsApp</h3>
              <p className="text-sm text-gray-500">
                Comprá fácil y rápido sin pasarelas de pago.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
