import { createClient } from '@/utils/supabase/server';
import type { Order } from '@/types';
import OrdersTable from './OrdersTable';

export default async function PedidosPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Historial de Pedidos</h1>
      <OrdersTable initialOrders={(orders as Order[]) || []} />
    </div>
  );
}
