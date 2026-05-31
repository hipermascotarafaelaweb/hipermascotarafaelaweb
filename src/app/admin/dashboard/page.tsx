'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Order } from '@/types';
import { formatPrice } from '@/utils/format';

interface SalesData {
  week: string;
  sales: number;
  revenue: number;
}

interface ProductSales {
  name: string;
  qty: number;
  revenue: number;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, thisWeek: 0, avgOrderValue: 0 });

  useEffect(() => {
    const fetch = async () => {
      const { data: orders } = await supabase.from('orders').select('*').neq('status', 'Cancelado');
      const orders_list = (orders as Order[]) || [];

      // Calcular estadísticas
      const totalRevenue = orders_list.reduce((sum, o) => sum + o.total_amount, 0);
      const avgOrderValue = orders_list.length > 0 ? totalRevenue / orders_list.length : 0;

      // Ventas por semana (últimas 8 semanas)
      const weeks: Record<string, { sales: number; revenue: number }> = {};
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const weekStart = new Date(d);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const week = weekStart.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' });
        weeks[week] = { sales: 0, revenue: 0 };
      }

      orders_list.forEach((o) => {
        const oDate = new Date(o.created_at);
        const weekStart = new Date(oDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const week = weekStart.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' });
        if (weeks[week]) {
          weeks[week].sales += 1;
          weeks[week].revenue += o.total_amount;
        }
      });

      const salesChartData = Object.entries(weeks).map(([week, data]) => ({
        week,
        sales: data.sales,
        revenue: data.revenue,
      }));

      // Top productos
      const productMap: Record<string, ProductSales> = {};
      orders_list.forEach((o) => {
        o.items.forEach((item) => {
          if (!productMap[item.name]) productMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
          productMap[item.name].qty += item.qty;
          productMap[item.name].revenue += item.qty * item.price;
        });
      });
      const topProds = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

      // Estadísticas de esta semana
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const thisWeekOrders = orders_list.filter((o) => new Date(o.created_at) >= weekStart);
      const thisWeekRevenue = thisWeekOrders.reduce((sum, o) => sum + o.total_amount, 0);

      setSalesData(salesChartData);
      setTopProducts(topProds);
      setStats({
        totalOrders: orders_list.length,
        totalRevenue,
        thisWeek: thisWeekRevenue,
        avgOrderValue,
      });
      setLoading(false);
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 font-logo">Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 font-semibold">Pedidos</p>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{stats.totalOrders}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 font-semibold">Ingresos</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500 font-semibold">Esta semana</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{formatPrice(stats.thisWeek)}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500 font-semibold">Promedio</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{formatPrice(stats.avgOrderValue)}</p>
            </div>
          </div>

          {/* Gráficas */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ventas por semana */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Ventas últimas 8 semanas</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8dc63f" name="Pedidos" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Ingresos por semana */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Ingresos últimas 8 semanas</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(val) => formatPrice(val as number)} />
                  <Bar dataKey="revenue" fill="#6aa82e" name="Ingresos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top productos */}
          {topProducts.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Productos más vendidos</h2>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">{i + 1}. {p.name}</p>
                      <p className="text-sm text-gray-500">{p.qty} unidades</p>
                    </div>
                    <p className="font-bold text-gray-900">{formatPrice(p.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
