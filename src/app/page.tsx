import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, MessageCircle, PawPrint, ShoppingBag } from 'lucide-react';
import FeaturedProducts from '@/components/FeaturedProducts';

const WHATSAPP = '5493492330291';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <PawPrint className="absolute -top-6 -left-6 w-40 h-40 text-brand-100 rotate-12" />
        <PawPrint className="absolute top-20 right-4 w-24 h-24 text-brand-100 -rotate-12 hidden sm:block" />
        <PawPrint className="absolute bottom-8 left-1/4 w-20 h-20 text-brand-100 rotate-45 hidden lg:block" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white border border-brand-200 text-brand-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm animate-fade-in-up">
            <PawPrint className="w-4 h-4" />
            Accesorios para mascotas en Rafaela
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.05] font-logo animate-fade-in-up">
            Todo para mimar a tu{' '}
            <span className="text-brand-500 relative whitespace-nowrap">
              mascota
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                <path d="M2 6.5C50 2 150 2 198 6.5" stroke="#84bf2f" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Explorá el catálogo, armá tu pedido y coordinamos la entrega.
            Rápido, fácil y con atención personalizada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-brand-600/25"
            >
              Ver productos
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-brand-400 text-gray-700 font-bold px-8 py-4 rounded-2xl text-lg transition-all"
            >
              <MessageCircle className="w-5 h-5 text-brand-600" />
              Escribinos
            </a>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-brand-700 font-semibold">
            <Truck className="w-5 h-5" />
            Envío gratis a domicilio en Rafaela
          </p>
        </div>
      </section>

      {/* Categorías + Destacados (carga desde Supabase en el cliente) */}
      <FeaturedProducts />

      {/* Beneficios */}
      <section className="bg-gradient-to-b from-white to-brand-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 font-logo">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-gray-500">Comprar para tu mascota nunca fue tan simple</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Truck,
                title: 'Envío gratis',
                text: 'Te lo llevamos a domicilio sin costo, a toda Rafaela.',
              },
              {
                icon: ShieldCheck,
                title: 'Calidad garantizada',
                text: 'Accesorios resistentes y seguros, elegidos uno por uno.',
              },
              {
                icon: ShoppingBag,
                title: 'Compra simple',
                text: 'Sin registros ni pasarelas. Elegí, pedí y listo.',
              },
            ].map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <b.icon className="w-8 h-8 text-brand-600" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo comprar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 font-logo">
            Comprar es facilísimo
          </h2>
          <p className="text-gray-500">En 3 pasos tenés tu pedido en camino</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: 1, icon: ShoppingBag, title: 'Elegí tus productos', text: 'Sumá al carrito todo lo que quieras para tu mascota.' },
            { n: 2, icon: MessageCircle, title: 'Confirmá por WhatsApp', text: 'Completá tus datos y nos llega tu pedido al instante.' },
            { n: 3, icon: Truck, title: 'Te lo enviamos gratis', text: 'Coordinamos la entrega a domicilio sin costo.' },
          ].map((step) => (
            <div key={step.n} className="relative bg-white rounded-3xl p-8 border border-gray-100 text-center">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 bg-brand-600 text-white rounded-full flex items-center justify-center font-extrabold shadow-md">
                {step.n}
              </span>
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2">
                <step.icon className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-brand-600 relative overflow-hidden">
        <PawPrint className="absolute -bottom-8 -right-8 w-48 h-48 text-brand-500/40 rotate-12" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 font-logo">
            ¿Listo para mimar a tu mascota?
          </h2>
          <p className="text-brand-50 text-lg mb-8 max-w-xl mx-auto">
            Explorá el catálogo completo y armá tu pedido. ¡Te esperamos!
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-brand-50 transition-colors"
          >
            Ver catálogo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
