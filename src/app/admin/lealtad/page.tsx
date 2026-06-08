'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trophy, User, Plus, RefreshCw } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import AdminGuard from '../AdminGuard';

export default function LoyaltyPage() {
  const supabase = createClient();
  const [loyaltyData, setLoyaltyData] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchDni, setSearchDni] = useState('');
  const [sortBy, setSortBy] = useState<'dni' | 'points'>('points');

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const { data: customers, error: err } = await supabase
          .from('customers')
          .select('dni, orders(total_amount)')
          .order('dni', { ascending: true });

        if (err) {
          setError(err.message);
          return;
        }

        const map = new Map<string, number>();
        (customers as Array<{ dni: string; orders: Array<{ total_amount: number }> | null }>).forEach((customer) => {
          const totalSpent = customer.orders?.reduce((sum: number, order) => sum + (order.total_amount || 0), 0) || 0;
          const points = Math.floor(totalSpent / 1000);
          if (points > 0) {
            map.set(customer.dni, points);
          }
        });

        setLoyaltyData(map);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPoints = async (dni: string, amount: number) => {
    setBusy(dni);
    try {
      const response = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, points: amount }),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.error || 'Error agregando puntos');
        return;
      }

      setLoyaltyData((prev) => {
        const map = new Map(prev);
        map.set(dni, (map.get(dni) || 0) + amount);
        return map;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusy(null);
    }
  };

  const filteredData = Array.from(loyaltyData.entries())
    .filter(([dni]) => dni.includes(searchDni))
    .sort((a, b) =>
      sortBy === 'dni'
        ? a[0].localeCompare(b[0])
        : b[1] - a[1]
    );

  const topCustomers = Array.from(loyaltyData.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalPoints = Array.from(loyaltyData.values()).reduce((sum, p) => sum + p, 0);

  return (
    <AdminGuard>
      <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Programa de Lealtad</h1>
            <p className="text-gray-600 mt-1">Puntos y recompensas de clientes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
              <p className="text-sm text-brand-600 font-bold uppercase">Clientes</p>
              <p className="text-3xl font-extrabold text-brand-700 mt-1">{loyaltyData.size}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-bold uppercase">Puntos totales</p>
              <p className="text-3xl font-extrabold text-blue-700 mt-1">{totalPoints.toLocaleString('es-AR')}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-bold uppercase">Promedio</p>
              <p className="text-3xl font-extrabold text-purple-700 mt-1">
                {loyaltyData.size > 0 ? Math.floor(totalPoints / loyaltyData.size) : 0}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {topCustomers.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Clientes
              </h2>
              <div className="grid gap-2">
                {topCustomers.map(([dni, points], idx) => (
                  <div key={dni} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-bold flex items-center justify-center text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-mono font-bold text-gray-900">{dni}</p>
                        <p className="text-sm text-gray-600">{points} puntos</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por DNI..."
              value={searchDni}
              onChange={(e) => setSearchDni(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dni' | 'points')}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="dni">DNI</option>
              <option value="points">Puntos</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchDni ? 'No se encontraron clientes' : 'No hay datos'}
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">DNI</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Puntos</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(([dni, points]) => (
                    <tr key={dni} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold">{dni}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                          {points} pts
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => addPoints(dni, 100)}
                          disabled={busy === dni}
                          className="p-2 text-gray-600 hover:text-green-600 disabled:opacity-50"
                        >
                          {busy === dni ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </AdminGuard>
  );
}
