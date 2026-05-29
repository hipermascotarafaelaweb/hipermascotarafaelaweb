'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Order } from '@/types';

const statusColors: Record<Order['status'], string> = {
  Pendiente: 'bg-yellow-100 text-yellow-800',
  Entregado: 'bg-green-100 text-green-800',
  Cancelado: 'bg-red-100 text-red-800',
};

function formatPrice(price: number): string {
  return price.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersTable({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const supabase = createClient();

  const updateStatus = async (id: number, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar el estado.');
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No hay pedidos registrados.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <ul className="space-y-0.5">
                      {order.items.map((item, i) => (
                        <li key={i} className="text-gray-700">
                          {item.qty}x {item.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ${formatPrice(order.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order.id, e.target.value as Order['status'])
                      }
                      className={`text-xs font-semibold px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-amber-500 ${statusColors[order.status]}`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
