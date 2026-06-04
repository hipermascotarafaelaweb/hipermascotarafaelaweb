'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';
import PromotionForm from './PromotionForm';
import type { Promotion } from '@/types';

type AdminPromotion = Promotion & { product_ids: number[]; category_ids: number[] };

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<AdminPromotion | null>(null);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotions/admin');
      const data = await res.json();
      if (data.success) {
        setPromotions(data.promotions);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPromotions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta promoción?')) return;

    try {
      const res = await fetch('/api/promotions/admin', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setPromotions(promotions.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingPromotion(null);
    fetchPromotions();
  };

  const isActive = (promo: AdminPromotion) => {
    const now = new Date();
    const from = new Date(promo.valid_from);
    const until = promo.valid_until ? new Date(promo.valid_until) : null;
    return promo.is_active && from <= now && (!until || until > now);
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Promociones</h1>
        <button
          onClick={() => {
            setEditingPromotion(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          Nueva Promoción
        </button>
      </div>

      {showForm && (
        <PromotionForm
          promotion={editingPromotion}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid gap-6">
        {promotions.map(promo => (
          <div
            key={promo.id}
            className="bg-white p-6 rounded-lg shadow border-l-4 border-brand-500"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold">{promo.title}</h3>
                {promo.description && (
                  <p className="text-gray-600 text-sm mt-1">{promo.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingPromotion(promo);
                    setShowForm(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="p-2 hover:bg-red-100 rounded text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Descuento</p>
                <p className="font-bold">
                  {promo.discount_type === 'percent'
                    ? `${promo.discount_percent}%`
                    : `$${promo.discount_fixed}`}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Productos</p>
                <p className="font-bold">{promo.product_ids?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Estado</p>
                <p className={`font-bold ${isActive(promo) ? 'text-green-600' : 'text-gray-500'}`}>
                  {isActive(promo) ? 'Activa' : 'Inactiva'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Válida hasta</p>
                <p className="font-bold text-xs">
                  {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('es-AR') : 'Sin límite'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {promotions.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            No hay promociones aún. ¡Crea la primera!
          </div>
        )}
      </div>
    </div>
  );
}
