'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/utils/format';

interface InventoryAlert {
  id: number;
  name: string;
  current_stock: number;
  low_stock_threshold: number;
  price: number;
  sales_velocity_30d: number;
  days_until_stockout: number;
  suggested_qty: number;
}

export default function InventoryPage() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/admin/inventory/alerts', {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const err = await response.json();
          setError(err.error || 'Error cargando alertas');
          return;
        }

        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const urgency = (daysLeft: number): 'critical' | 'warning' | 'low' => {
    if (daysLeft <= 7) return 'critical';
    if (daysLeft <= 14) return 'warning';
    return 'low';
  };

  const urgencyColor = {
    critical: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    low: 'bg-blue-50 border-blue-200',
  };

  const urgencyText = {
    critical: 'text-red-700',
    warning: 'text-yellow-700',
    low: 'text-blue-700',
  };

  return (
    <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Alertas de Inventario</h1>
            <p className="text-gray-600 mt-1">Productos con bajo stock</p>
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
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              ✓ Todos los productos tienen stock suficiente
            </div>
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => {
                const urg = urgency(alert.days_until_stockout);
                return (
                  <div
                    key={alert.id}
                    className={`border-2 rounded-lg p-4 ${urgencyColor[urg]}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {urg === 'critical' && (
                            <AlertTriangle className={`w-5 h-5 ${urgencyText[urg]}`} />
                          )}
                          <h3 className={`font-bold text-lg ${urgencyText[urg]}`}>
                            {alert.name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                          <div>
                            <p className="text-gray-600 text-xs uppercase font-bold">Stock</p>
                            <p className="font-bold text-lg">{alert.current_stock} un.</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs uppercase font-bold">Límite</p>
                            <p className="font-bold text-lg">{alert.low_stock_threshold} un.</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs uppercase font-bold">Venta 30d</p>
                            <p className="font-bold text-lg flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {alert.sales_velocity_30d} un.
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs uppercase font-bold">Días</p>
                            <p className={`font-bold text-lg ${urgencyText[urg]}`}>
                              {alert.days_until_stockout} días
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-white/60 rounded border border-current/20">
                          <p className="text-sm text-gray-700">
                            <strong>Comprar:</strong> {alert.suggested_qty} unidades ({formatPrice(alert.price * alert.suggested_qty)})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </div>
  );
}
