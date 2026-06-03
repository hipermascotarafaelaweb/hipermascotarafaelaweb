'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Product } from '@/types';

interface ProductSelectorProps {
  selectedProductIds: number[];
  onSelect: (productIds: number[]) => void;
}

export default function ProductSelector({
  selectedProductIds,
  onSelect,
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: number) => {
    if (selectedProductIds.includes(productId)) {
      onSelect(selectedProductIds.filter(id => id !== productId));
    } else {
      onSelect([...selectedProductIds, productId]);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="mt-4 text-center text-gray-600">Cargando productos...</div>;
  }

  return (
    <div className="mt-4 border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <div className="space-y-2">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-4">
            {search ? 'No se encontraron productos' : 'No hay productos disponibles'}
          </p>
        ) : (
          filteredProducts.map(product => (
            <label
              key={product.id}
              className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedProductIds.includes(product.id)}
                onChange={() => toggleProduct(product.id)}
                className="w-4 h-4"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-600">${product.price.toFixed(0)}</p>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
