import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';

const statusColors: Record<string, string> = {
  Pendiente: 'bg-amber-100 text-amber-800',
  Entregado: 'bg-green-100 text-green-800',
  Cancelado: 'bg-red-100 text-red-800',
};

export default function OrderList({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 font-semibold">{orders.length} pedido(s) encontrado(s)</p>
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-extrabold text-gray-900">Pedido #{order.id}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
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
  );
}
