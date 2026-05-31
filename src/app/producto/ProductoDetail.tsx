'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingCart, Check, Minus, Plus, MessageCircle,
  PawPrint, Truck, ShieldCheck, Loader2, Star,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

const WHATSAPP = '5493492330291';

export default function ProductoDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single()
      .then(async ({ data }) => {
        const p = data as Product | null;
        setProduct(p);
        setLoading(false);
        if (p?.category_id) {
          const { data: rel } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('category_id', p.category_id)
            .neq('id', p.id)
            .limit(4);
          setRelated((rel as Product[]) || []);
        }
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center">
        <PawPrint className="w-14 h-14 text-gray-200 mx-auto mb-4" />
        <h1 className="text-xl font-extrabold text-gray-900 mb-2">Producto no encontrado</h1>
        <p className="text-gray-500 mb-6">Puede que ya no esté disponible.</p>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const consultMsg = `🐾 ¡Hola Hipermascota! Quería consultar por: ${product.name} (${formatPrice(product.price)}).`;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/productos"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagen */}
        <div className="relative aspect-square rounded-3xl bg-brand-50/50 overflow-hidden border border-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-200">
              <PawPrint className="w-24 h-24" />
            </div>
          )}
          {product.is_featured && !outOfStock && (
            <span className="absolute top-4 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" /> Destacado
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link
              href={`/productos?categoria=${product.category.slug}`}
              className="text-sm text-brand-600 font-bold uppercase tracking-wider mb-2 hover:text-brand-700"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
            {product.name}
          </h1>
          <p className="text-3xl font-extrabold text-gray-900 mb-4">
            {formatPrice(product.price)}
          </p>

          {outOfStock ? (
            <span className="inline-flex w-fit items-center bg-red-50 text-red-600 text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
              Sin stock por el momento
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-1.5 bg-brand-50 text-brand-700 text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
              <Check className="w-4 h-4" />
              {product.stock <= 5 ? `¡Últimas ${product.stock} unidades!` : 'Disponible'}
            </span>
          )}

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              {product.description}
            </p>
          )}

          {!outOfStock && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-semibold text-gray-600">Cantidad</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:border-brand-400 hover:text-brand-600 transition-colors"
                  aria-label="Reducir"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:border-brand-400 hover:text-brand-600 transition-colors"
                  aria-label="Aumentar"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              disabled={outOfStock || added}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 text-white font-bold py-3.5 px-6 rounded-2xl transition-all',
                added
                  ? 'bg-brand-500'
                  : outOfStock
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-700 active:scale-[0.98] shadow-lg shadow-brand-600/20'
              )}
            >
              {added ? (
                <><Check className="w-5 h-5" /> Sumado al pedido</>
              ) : outOfStock ? (
                'Sin stock'
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Agregar al pedido</>
              )}
            </button>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(consultMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-brand-400 text-gray-700 font-bold py-3.5 px-6 rounded-2xl transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-brand-600" />
              Consultar
            </a>
          </div>

          {/* Garantías */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Truck className="w-5 h-5 text-brand-600 shrink-0" />
              Envío gratis a domicilio
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
              Calidad garantizada
            </div>
          </div>
        </div>
      </div>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 font-logo">
            También te puede gustar
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
