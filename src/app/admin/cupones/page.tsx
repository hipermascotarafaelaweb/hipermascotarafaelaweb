'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Loader2, Ticket, Calendar } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Coupon } from '@/types';

interface CouponForm {
  code: string;
  discount_percent: string;
  max_uses: string;
  valid_until: string;
}

const emptyForm: CouponForm = {
  code: '',
  discount_percent: '10',
  max_uses: '',
  valid_until: '',
};

export default function CuponesPage() {
  const supabase = createClient();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons((data as Coupon[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discount_percent: String(coupon.discount_percent),
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount_percent) {
      setError('Código y descuento son obligatorios.');
      return;
    }
    setBusy(true);
    setError('');

    const payload = {
      code: form.code.toUpperCase().trim(),
      discount_percent: parseInt(form.discount_percent),
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      valid_until: form.valid_until || null,
      active: true,
    };

    const { error: dbError } = editingId
      ? await supabase.from('coupons').update(payload).eq('id', editingId)
      : await supabase.from('coupons').insert(payload);

    setBusy(false);
    if (dbError) {
      setError('No se pudo guardar el cupón. ¿El código ya existe?');
      return;
    }
    setShowForm(false);
    fetchCoupons();
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`¿Eliminar cupón "${coupon.code}"?`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', coupon.id);
    if (error) {
      alert('No se pudo eliminar.');
      return;
    }
    fetchCoupons();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 font-logo">Cupones</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo cupón
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Sin cupones todavía.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => {
            const expired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
            const maxReached = coupon.max_uses && coupon.uses_count >= coupon.max_uses;
            const isDisabled = expired || maxReached || !coupon.active;

            return (
              <div
                key={coupon.id}
                className={`rounded-2xl border p-5 transition-colors ${
                  isDisabled
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-brand-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-extrabold text-2xl text-brand-600">{coupon.code}</p>
                    <p className="text-lg font-bold text-gray-900">-{coupon.discount_percent}%</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(coupon)}
                      className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                      aria-label="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <ul className="text-xs text-gray-500 space-y-1.5">
                  {coupon.max_uses && (
                    <li>
                      Usos: <strong>{coupon.uses_count}</strong> / {coupon.max_uses}
                    </li>
                  )}
                  {coupon.valid_until && (
                    <li className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Vence: {new Date(coupon.valid_until).toLocaleDateString('es-AR')}
                    </li>
                  )}
                </ul>

                {isDisabled && (
                  <p className="text-xs text-red-600 font-semibold mt-3">
                    {expired ? '❌ Expirado' : maxReached ? '⚠️ Límite alcanzado' : '🔒 Inactivo'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900">
                {editingId ? 'Editar cupón' : 'Nuevo cupón'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Código (ej. AMIGO10) *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="AMIGO10"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descuento (%) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={form.discount_percent}
                  onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Máximo de usos</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="Sin límite"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Válido hasta</label>
                <input
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-3 rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                {busy ? 'Guardando…' : 'Guardar cupón'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
