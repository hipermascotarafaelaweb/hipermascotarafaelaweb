'use client';

import { useState } from 'react';
import { User, Phone, MapPin, CreditCard, Package, ClipboardList } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';

const statusStyles: Record<Order['status'], string> = {
  Pendiente: 'bg-amber-100 text-amber-800 ring-amber-200',
  Entregado: 'bg-brand-100 text-brand-800 ring-brand-200',
  Cancelado: 'bg-red-100 text-red-700 ring-red-200',
};

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<'Todos' | Order['status']>('Todos');
  const supabase = createClient();

  const updateStatus = async (id: number, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      alert('No se pudo actualizar el estado.');
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const filtered = filter === 'Todos' ? orders : orders.filter((o) => o.status === filter);

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
        <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400">Todavía no hay pedidos registrados.</p>
        <p className="text-gray-300 text-sm mt-1">
          Aparecerán acá cuando un cliente confirme su compra.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {(['Todos', 'Pendiente', 'Entregado', 'Cancelado'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-extrabold text-gray-900">Pedido #{order.id}</p>
                <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
              </div>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                className={`text-xs font-bold px-3 py-1.5 rounded-full ring-1 cursor-pointer focus:outline-none ${statusStyles[order.status]}`}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            {/* Datos del cliente */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm mb-3">
              <p className="flex items-center gap-2 text-gray-800 font-semibold">
                <User className="w-4 h-4 text-brand-600 shrink-0" />
                {order.customer_name || 'Sin nombre'}
                {order.customer_dni && (
                  <span className="text-gray-400 font-normal flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> {order.customer_dni}
                  </span>
                )}
              </p>
              {order.customer_phone && (
                <a
                  href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-700 hover:underline"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  {order.customer_phone}
                </a>
              )}
              {order.customer_address && (
                <p className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  {order.customer_address}
                </p>
              )}
            </div>

            {/* Items */}
            <ul className="space-y-1 mb-3">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <Package className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  <span className="font-medium">{item.qty}x</span> {item.name}
                  <span className="text-gray-400 ml-auto">{formatPrice(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">🚚 Envío gratis</span>
              <span className="font-extrabold text-gray-900">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
