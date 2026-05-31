import { Suspense } from 'react';
import ProductoDetail from './ProductoDetail';

export const metadata = {
  title: 'Producto | Hipermascota Rafaela',
};

export default function ProductoPage() {
  return (
    <Suspense>
      <ProductoDetail />
    </Suspense>
  );
}
