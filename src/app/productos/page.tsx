import { Suspense } from 'react';
import ProductosClient from './ProductosClient';

export const metadata = {
  title: 'Productos | Hipermascota Rafaela',
  description:
    'Catálogo completo de accesorios para perros y gatos: collares, juguetes, comederos, camas y más. Envío gratis y pedido por WhatsApp.',
};

export default function ProductosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-logo">
          Nuestros productos
        </h1>
        <p className="text-gray-500 mt-1">Elegí lo que necesitás y sumalo a tu pedido.</p>
      </div>
      <Suspense>
        <ProductosClient />
      </Suspense>
    </div>
  );
}
