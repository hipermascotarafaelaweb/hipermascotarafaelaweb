'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingCart, Check, Minus, Plus, MessageCircle,
  PawPrint, Truck, ShieldCheck, Loader2, Star, Tag,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useCartStore } from '@/store/cart';
import { formatPrice, hasDiscount, effectivePrice, discountPercent } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Product, Promotion } from '@/types';
import ProductCard from '@/components/ProductCard';
import { applyPromotionToProduct } from '@/utils/promotions';

const WHATSAPP = '5493492330291'; // Force Vercel redeploy

export default function ProductoDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

        // Fetch active promotions for this product
        const now = new Date().toISOString();

        // Step 1: Get promotion IDs linked to this product
        const { data: links, error: linksError } = await supabase
          .from('promotion_products')
          .select('promotion_id')
          .eq('product_id', id);

        if (links && links.length > 0 && !linksError) {
          // Step 2: Get the actual promotions
          const promoIds = links.map((l) => (l as { promotion_id: number }).promotion_id);
          const { data: promos } = await supabase
            .from('promotions')
            .select('*')
            .in('id', promoIds)
            .eq('is_active', true);

          if (promos) {
            const activePromos = (promos as Promotion[]).filter(promo =>
              new Date(promo.valid_from) <= new Date(now) &&
              (!promo.valid_until || new Date(promo.valid_until) >= new Date(now))
            );
            setPromotions(activePromos);
          }
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

  // Producto con la promoción activa incorporada al precio (si conviene).
  const displayProduct = promotions.length > 0
    ? applyPromotionToProduct(product, promotions[0])
    : product;

  const outOfStock = product.stock <= 0;
  const onSale = hasDiscount(displayProduct);
  // Galería: foto principal + adicionales, sin duplicados ni vacíos.
  const gallery = [product.image_url, ...(product.images ?? [])].filter(
    (src, i, arr): src is string => !!src && arr.indexOf(src) === i
  );
  const mainImg = gallery[Math.min(activeImg, gallery.length - 1)];
  const consultMsg = `🐾 ¡Hola Hipermascota! Quería consultar por: ${product.name} (${formatPrice(effectivePrice(displayProduct))}).`;

  const handleAdd = () => {
    addItem(displayProduct, qty);
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
        {/* Galería */}
        <div>
          <div className="relative aspect-square rounded-3xl bg-brand-50/50 overflow-hidden border border-gray-100">
            {mainImg ? (
              <Image
                src={mainImg}
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
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {onSale && !outOfStock && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 fill-current" /> -{discountPercent(displayProduct)}% OFF
                </span>
              )}
              {product.is_featured && !outOfStock && (
                <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> Destacado
                </span>
              )}
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-2.5 mt-3">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden border-2 transition-colors',
                    i === activeImg ? 'border-brand-500' : 'border-transparent hover:border-brand-200'
                  )}
                  aria-label={`Ver foto ${i + 1}`}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
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
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
            <p className={cn('text-3xl font-extrabold', onSale ? 'text-red-600' : 'text-gray-900')}>
              {formatPrice(effectivePrice(displayProduct))}
            </p>
            {onSale && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-0.5 rounded-lg">
                  -{discountPercent(displayProduct)}%
                </span>
              </>
            )}
          </div>

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

          {promotions.length > 0 && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6">
              {promotions.map(promo => (
                <div key={promo.id} className="mb-3 last:mb-0">
                  <p className="font-bold text-brand-700 text-sm">{promo.title}</p>
                  {promo.description && (
                    <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                  )}
                  {(promo.discount_percent || promo.discount_fixed) && (
                    <p className="text-sm font-semibold text-brand-600 mt-1">
                      {promo.discount_percent && `${promo.discount_percent}% descuento`}
                      {promo.discount_percent && promo.discount_fixed && ' o '}
                      {promo.discount_fixed && `$${promo.discount_fixed.toFixed(2)} descuento`}
                    </p>
                  )}
                </div>
              ))}
            </div>
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
              Envío a todo el país
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
