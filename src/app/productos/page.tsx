import ProductosClient from './ProductosClient';

export const metadata = {
  title: 'Productos | Hipermascota Rafaela',
};

export default function ProductosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nuestros Productos</h1>
      <ProductosClient />
    </div>
  );
}
