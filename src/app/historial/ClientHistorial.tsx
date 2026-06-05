'use client';

import { useState } from 'react';
import { Search, Loader2, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';

const statusColors: Record<string, string> = {
  Pendiente: 'bg-amber-100 text-amber-800',
  Entregado: 'bg-green-100 text-green-800',
  Cancelado: 'bg-red-100 text-red-800',
};

export default function ClientHistorial() {
  const [dni, setDni] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim()) {
      setError('Ingresá tu DNI');
      return;
    }
    setSearching(true);
    setNotFound(false);
    setError('');
    setOrders([]);

    try {
      const res = await fetch('/api/historial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni }),
      });

      const data = await res.json();
      setSearching(false);

      if (!res.ok) {
        setError(data.error || 'Error al buscar pedidos');
        setNotFound(true);
        return;
      }

      if (!data.orders || data.orders.length === 0) {
        setNotFound(true);
        return;
      }

      setOrders((data.orders as Order[]) || []);
    } catch (err) {
      setSearching(false);
      setError('Error de conexión. Probá de nuevo.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 font-logo">
          Historial de compras
        </h1>
        <p className="text-gray-500">Ingresá tu DNI para ver tus pedidos</p>
      </div>

      <form onSubmit={handleSearch} className="mb-12 space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ingresá tu DNI (sin puntos ni guiones)"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-2xl transition-colors shrink-0 whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}
      </form>

      {searching && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      )}

      {notFound && !searching && dni && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="text-blue-900 font-semibold">No encontramos pedidos con ese DNI.</p>
          <p className="text-blue-700 text-sm mt-1">¿Usaste otro DNI o nombre? Probá de nuevo.</p>
        </div>
      )}

      {orders.length > 0 && !searching && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-semibold">{orders.length} pedido(s) encontrado(s)</p>
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-extrabold text-gray-900">Pedido #{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    statusColors[order.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Productos:</p>
                <ul className="space-y-2">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {item.qty}x {item.name}
                      </span>
                      <span className="font-semibold">{formatPrice(item.qty * item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-gray-600 font-semibold">Total</span>
                <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{formatPrice(order.total_amount)}</span>
              </div>

              {order.customer_address && (
                <p className="text-xs text-gray-500 mt-3">
                  📍 Entrega en: {order.customer_address}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!searching && !notFound && !dni && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center">
          <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Ingresá tu DNI arriba para ver tu historial de compras.</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 font-semibold"
        >
          ← Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
