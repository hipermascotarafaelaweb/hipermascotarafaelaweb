'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Product, Category } from '@/types';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category_id: string;
  stock: string;
  is_featured: boolean;
  image: File | null;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  stock: '0',
  is_featured: false,
  image: null,
};

function formatPrice(price: number): string {
  return price.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default function AdminProductsTable({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const supabase = createClient();

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      category_id: product.category_id ? String(product.category_id) : '',
      stock: String(product.stock),
      is_featured: product.is_featured,
      image: null,
    });
    setShowForm(true);
    setError('');
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from('products')
      .upload(fileName, file, { upsert: true });

    if (error) return null;

    const { data } = supabase.storage.from('products').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let image_url: string | null | undefined;

    if (form.image) {
      image_url = await uploadImage(form.image);
      if (!image_url) {
        setError('Error al subir la imagen.');
        setLoading(false);
        return;
      }
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      category_id: form.category_id ? parseInt(form.category_id) : null,
      stock: parseInt(form.stock),
      is_featured: form.is_featured,
      ...(image_url !== undefined && { image_url }),
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId);

      if (updateError) {
        setError('Error al actualizar el producto.');
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert(payload);

      if (insertError) {
        setError('Error al crear el producto.');
        setLoading(false);
        return;
      }
    }

    setShowForm(false);
    setLoading(false);
    router.refresh();

    const { data: refreshed } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (refreshed) setProducts(refreshed as Product[]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar el producto.');
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{products.length} productos</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-4 py-3 hover:border-amber-400 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {form.image ? form.image.name : 'Seleccionar archivo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.files?.[0] || null })
                    }
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">Producto destacado</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Destacado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No hay productos cargados aún.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.category?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${
                          product.stock <= 0
                            ? 'text-red-600'
                            : product.stock <= 5
                              ? 'text-amber-600'
                              : 'text-green-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.is_featured ? (
                        <span className="inline-block w-2 h-2 bg-amber-500 rounded-full" />
                      ) : (
                        <span className="inline-block w-2 h-2 bg-gray-300 rounded-full" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
