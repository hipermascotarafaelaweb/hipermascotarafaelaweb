'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Save, Upload, PawPrint, Search, Star, ImagePlus, Tag } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Product, Category, PetType } from '@/types';
import { formatPrice, hasDiscount } from '@/utils/format';
import { compressImage } from '@/utils/imageCompress';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  sale_price: string;
  category_id: string;
  stock: string;
  pet_type: PetType;
  is_featured: boolean;
  image: File | null;
  gallery: File[];
  existingImages: string[];
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  sale_price: '',
  category_id: '',
  stock: '0',
  pet_type: 'ambos',
  is_featured: false,
  image: null,
  gallery: [],
  existingImages: [],
};

const petLabels: Record<PetType, string> = {
  ambos: 'Perros y gatos',
  perro: 'Solo perros',
  gato: 'Solo gatos',
};

export default function AdminProductsTable({
  initialProducts,
  categories,
  onRefresh,
}: {
  initialProducts: Product[];
  categories: Category[];
  onRefresh?: () => void;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const supabase = createClient();

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setCurrentImage(null);
    setShowForm(true);
    setError('');
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      sale_price: product.sale_price != null ? String(product.sale_price) : '',
      category_id: product.category_id ? String(product.category_id) : '',
      stock: String(product.stock),
      pet_type: product.pet_type ?? 'ambos',
      is_featured: product.is_featured,
      image: null,
      gallery: [],
      existingImages: product.images ?? [],
    });
    setCurrentImage(product.image_url);
    setShowForm(true);
    setError('');
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file);
    const ext = compressed.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('products').upload(fileName, compressed, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from('products').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const refreshList = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    if (data) setProducts(data as Product[]);
    onRefresh?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const price = parseFloat(form.price);
    const salePrice = form.sale_price.trim() ? parseFloat(form.sale_price) : null;
    if (salePrice != null && salePrice >= price) {
      setError('El precio de oferta debe ser menor al precio normal.');
      setLoading(false);
      return;
    }

    let image_url: string | null | undefined;
    if (form.image) {
      image_url = await uploadImage(form.image);
      if (!image_url) {
        setError('No se pudo subir la imagen.');
        setLoading(false);
        return;
      }
    }

    // Subir las fotos nuevas de la galería y conservar las existentes.
    const uploadedGallery: string[] = [];
    for (const file of form.gallery) {
      const url = await uploadImage(file);
      if (!url) {
        setError('No se pudo subir una de las fotos de la galería.');
        setLoading(false);
        return;
      }
      uploadedGallery.push(url);
    }
    const images = [...form.existingImages, ...uploadedGallery];

    const payload = {
      name: form.name,
      description: form.description || null,
      price,
      sale_price: salePrice,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      stock: parseInt(form.stock),
      pet_type: form.pet_type,
      images,
      is_featured: form.is_featured,
      ...(image_url !== undefined && { image_url }),
    };

    const { error: dbError } = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert(payload);

    if (dbError) {
      setError('No se pudo guardar el producto.');
      setLoading(false);
      return;
    }

    setShowForm(false);
    setLoading(false);
    await refreshList();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('No se pudo eliminar el producto.');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    onRefresh?.();
  };

  const previewUrl = form.image ? URL.createObjectURL(form.image) : currentImage;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Producto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell">Categoría</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500">Precio</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500">Stock</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                    {products.length === 0 ? 'No hay productos cargados aún.' : 'Sin resultados.'}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg bg-brand-50 overflow-hidden shrink-0">
                          {product.image_url ? (
                            <Image src={product.image_url} alt="" fill className="object-cover" sizes="44px" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-200">
                              <PawPrint className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                            {product.name}
                            {product.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          </p>
                          <p className="text-xs text-gray-400 sm:hidden">{product.category?.name || 'Sin categoría'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{product.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {hasDiscount(product) ? (
                        <span className="inline-flex flex-col items-end leading-tight">
                          <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                          <span className="font-semibold text-red-600 inline-flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {formatPrice(product.sale_price as number)}
                          </span>
                        </span>
                      ) : (
                        <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block min-w-[2rem] font-bold ${
                          product.stock <= 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : 'text-brand-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-extrabold text-gray-900">
                {editingId ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

              {/* Imagen */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl bg-brand-50 overflow-hidden shrink-0 border border-gray-100">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="" fill className="object-cover" sizes="80px" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-200">
                      <PawPrint className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <label className="flex-1 flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-3 hover:border-brand-400 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 truncate">
                    {form.image ? form.image.name : 'Foto principal'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                  />
                </label>
              </div>

              {/* Galería (fotos adicionales) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Galería (fotos adicionales)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {form.existingImages.map((src) => (
                    <div key={src} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 group">
                      <Image src={src} alt="" fill className="object-cover" sizes="64px" unoptimized />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, existingImages: form.existingImages.filter((s) => s !== src) })
                        }
                        className="absolute top-0.5 right-0.5 bg-gray-900/70 text-white rounded-full p-0.5"
                        aria-label="Quitar foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {form.gallery.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-brand-200">
                      <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" sizes="64px" unoptimized />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, gallery: form.gallery.filter((_, j) => j !== i) })
                        }
                        className="absolute top-0.5 right-0.5 bg-gray-900/70 text-white rounded-full p-0.5"
                        aria-label="Quitar foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 flex flex-col items-center justify-center gap-1 cursor-pointer border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors">
                    <ImagePlus className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setForm({ ...form, gallery: [...form.gallery, ...Array.from(e.target.files || [])] })
                      }
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1">
                    <Tag className="w-3.5 h-3.5 text-red-500" />
                    Precio de oferta
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Opcional"
                    value={form.sale_price}
                    onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Para</label>
                  <select
                    value={form.pet_type}
                    onChange={(e) => setForm({ ...form, pet_type: e.target.value as PetType })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                  >
                    {(Object.keys(petLabels) as PetType[]).map((t) => (
                      <option key={t} value={t}>{petLabels[t]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer bg-brand-50/60 rounded-xl px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-brand-600"
                />
                <span className="text-sm font-semibold text-gray-700">Mostrar como destacado en la home</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-3 rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardando…' : 'Guardar producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
