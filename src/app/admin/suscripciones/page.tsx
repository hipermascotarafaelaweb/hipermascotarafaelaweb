'use client';

import { useEffect, useState } from 'react';
import { Pause, Play, Trash2, Loader2, Calendar, User, Package } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import AdminGuard from '../AdminGuard';
import { formatPrice } from '@/utils/format';

interface Subscription {
  id: number;
  customer_dni: string;
  product_id: number;
  qty: number;
  every_days: number;
  next_at: string;
  active: boolean;
  created_at: string;
}

export default function SubscriptionsPage() {
  const supabase = createClient();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setSubscriptions((data as Subscription[]) || []);
      }
      setLoading(false);
    };

    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleActive = async (id: number, currentActive: boolean) => {
    setBusy(id);
    const { error: err } = await supabase
      .from('subscriptions')
      .update({ active: !currentActive })
      .eq('id', id);

    if (err) {
      setError(err.message);
    } else {
      setSubscriptions((subs) =>
        subs.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
      );
    }
    setBusy(null);
  };

  const deleteSubscription = async (id: number) => {
    if (!confirm('¿Cancelar suscripción?')) return;
    setBusy(id);
    const { error: err } = await supabase.from('subscriptions').delete().eq('id', id);

    if (err) {
      setError(err.message);
    } else {
      setSubscriptions((subs) => subs.filter((s) => s.id !== id));
    }
    setBusy(null);
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Suscripciones</h1>
            <p className="text-gray-600 mt-1">Gestiona las suscripciones recurrentes de clientes</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay suscripciones activas
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Cantidad</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Cada</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Próximo</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{sub.customer_dni}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{sub.qty} un.</td>
                      <td className="px-4 py-3 text-sm">{sub.every_days} días</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(sub.next_at).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            sub.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {sub.active ? 'Activa' : 'Pausada'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <button
                          onClick={() => toggleActive(sub.id, sub.active)}
                          disabled={busy === sub.id}
                          className="p-2 text-gray-600 hover:text-brand-600 disabled:opacity-50"
                        >
                          {busy === sub.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : sub.active ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteSubscription(sub.id)}
                          disabled={busy === sub.id}
                          className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
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
