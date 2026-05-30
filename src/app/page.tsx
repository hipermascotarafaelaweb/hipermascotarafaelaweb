import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, MessageCircle, Star } from 'lucide-react';
import InstagramIcon from '@/components/InstagramIcon';
import FeaturedProducts from '@/components/FeaturedProducts';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-lime-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-9xl">🐾</div>
          <div className="absolute bottom-10 right-10 text-9xl">🐾</div>
          <div className="absolute top-1/2 left-1/2 text-9xl -translate-x-1/2 -translate-y-1/2">🐾</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 fill-green-600 text-green-600" />
            Accesorios para mascotas en Rafaela
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Todo para tu{' '}
            <span className="text-green-600 relative">
              mascota
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5C47 1.5 153 1.5 199 5.5" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
            <br />en un solo lugar
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Explorá nuestro catálogo de accesorios, armá tu pedido y confirmalo
            directamente por WhatsApp. ¡Rápido, fácil y sin complicaciones!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-green-600/25"
            >
              Ver Productos
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/5493492330291"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-green-400 text-gray-700 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              Escribinos
            </a>
          </div>
        </div>
      </section>

      {/* Productos destacados - client-side fetch */}
      <FeaturedProducts />

      {/* Beneficios */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              ¿Por qué elegirnos?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Envíos en Rafaela</h3>
              <p className="text-sm text-gray-500">
                Coordinamos la entrega directamente con vos por WhatsApp.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Calidad Garantizada</h3>
              <p className="text-sm text-gray-500">
                Accesorios resistentes y seguros para tu mascota.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Compra por WhatsApp</h3>
              <p className="text-sm text-gray-500">
                Sin registros ni pasarelas. Pedí y coordiná al instante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            ¿Listo para mimar a tu mascota?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Explorá nuestro catálogo completo y armá tu pedido. ¡Te esperamos!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-green-50 transition-colors"
            >
              Ver Catálogo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://instagram.com/hipermascotarafaela"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-white/10 transition-colors"
            >
              <InstagramIcon className="w-5 h-5" />
              Seguinos en Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
