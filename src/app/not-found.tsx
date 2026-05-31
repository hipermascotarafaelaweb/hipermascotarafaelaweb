import Link from 'next/link';
import { PawPrint, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <PawPrint className="w-10 h-10 text-brand-400" />
        </div>
        <p className="text-5xl font-extrabold text-brand-600 mb-2 font-logo">404</p>
        <h1 className="text-xl font-extrabold text-gray-900 mb-2">
          No encontramos esta página
        </h1>
        <p className="text-gray-500 mb-8">
          Puede que el enlace esté roto o que la página ya no exista.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 border-2 border-gray-200 hover:border-brand-400 text-gray-700 font-bold px-6 py-3 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver productos
          </Link>
        </div>
      </div>
    </div>
  );
}
