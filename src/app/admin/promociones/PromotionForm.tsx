'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ProductSelector from './ProductSelector';

interface PromotionFormProps {
  promotion?: any;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function PromotionForm({
  promotion,
  onSubmit,
  onCancel,
}: PromotionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>(
    promotion?.product_ids || []
  );

  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    discount_type: promotion?.discount_type || 'percent',
    discount_percent: promotion?.discount_percent || '',
    discount_fixed: promotion?.discount_fixed || '',
    image_url: promotion?.image_url || '',
    badge_label: promotion?.badge_label || 'Promoción',
    display_priority: promotion?.display_priority || 0,
    is_active: promotion?.is_active !== false,
    valid_from: promotion?.valid_from?.split('T')[0] || '',
    valid_until: promotion?.valid_until?.split('T')[0] || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación del descuento
    if (formData.discount_type === 'percent') {
      if (!formData.discount_percent || parseInt(formData.discount_percent) <= 0) {
        setError('Ingresá un descuento válido (entre 1 y 100%)');
        setLoading(false);
        return;
      }
    } else {
      if (!formData.discount_fixed || parseFloat(formData.discount_fixed) <= 0) {
        setError('Ingresá un monto de descuento válido');
        setLoading(false);
        return;
      }
    }

    if (!formData.title.trim()) {
      setError('El título es requerido');
      setLoading(false);
      return;
    }

    try {
      const method = promotion ? 'PATCH' : 'POST';
      const url = '/api/promotions/admin';
      const body = {
        ...formData,
        id: promotion?.id,
        discount_percent:
          formData.discount_type === 'percent' ? parseInt(formData.discount_percent) : null,
        discount_fixed:
          formData.discount_type === 'fixed' ? parseFloat(formData.discount_fixed) : null,
      };

      const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save promotion');

      const promotionId = data.promotion.id;

      // Link products to promotion
      if (selectedProducts.length > 0) {
        // First, delete existing links
        const existingProducts = promotion?.product_ids || [];
        for (const productId of existingProducts) {
          if (!selectedProducts.includes(productId)) {
            await fetch('/api/promotions/admin/products', {
              method: 'DELETE',
              body: JSON.stringify({ promotion_id: promotionId, product_id: productId }),
            });
          }
        }

        // Add new links
        const newProducts = selectedProducts.filter(
          id => !existingProducts.includes(id)
        );
        if (newProducts.length > 0) {
          await fetch('/api/promotions/admin/products', {
            method: 'POST',
            body: JSON.stringify({
              promotion_id: promotionId,
              product_ids: newProducts,
            }),
          });
        }
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving promotion:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar la promoción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {promotion ? 'Editar Promoción' : 'Nueva Promoción'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2">Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Ej: 20% de descuento en juguetes"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 h-24"
              placeholder="Descripción de la promoción"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Tipo de Descuento *</label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="percent">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($)</option>
              </select>
            </div>

            {formData.discount_type === 'percent' ? (
              <div>
                <label className="block text-sm font-bold mb-2">Descuento (%)*</label>
                <input
                  type="number"
                  name="discount_percent"
                  value={formData.discount_percent}
                  onChange={handleChange}
                  required
                  min="1"
                  max="100"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ej: 20"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold mb-2">Descuento ($)*</label>
                <input
                  type="number"
                  name="discount_fixed"
                  value={formData.discount_fixed}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ej: 5000"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Etiqueta del Badge</label>
            <input
              type="text"
              name="badge_label"
              value={formData.badge_label}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Ej: ¡Oferta!"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">URL de Imagen</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Válida desde</label>
              <input
                type="date"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Válida hasta</label>
              <input
                type="date"
                name="valid_until"
                value={formData.valid_until}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Prioridad</label>
              <input
                type="number"
                name="display_priority"
                value={formData.display_priority}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="0 (mayor prioridad)"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold">Activa</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Productos ({selectedProducts.length})</label>
            <button
              type="button"
              onClick={() => setShowProductSelector(!showProductSelector)}
              className="w-full border-2 border-dashed border-brand-300 rounded-lg p-3 text-brand-600 font-bold hover:bg-brand-50"
            >
              {selectedProducts.length === 0
                ? 'Seleccionar productos...'
                : `${selectedProducts.length} productos seleccionados`}
            </button>

            {showProductSelector && (
              <ProductSelector
                selectedProductIds={selectedProducts}
                onSelect={setSelectedProducts}
              />
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Promoción'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border rounded-lg px-4 py-2 font-bold hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
