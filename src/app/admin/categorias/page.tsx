'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Check, Loader2, Tag } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Category } from '@/types';

/** Convierte un nombre en slug: "Ropa y Abrigos" → "ropa-y-abrigos". */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoriasPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const [catsRes, prodsRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('category_id'),
    ]);
    setCategories((catsRes.data as Category[]) || []);
    const c: Record<number, number> = {};
    for (const p of (prodsRes.data as { category_id: number | null }[]) || []) {
      if (p.category_id != null) c[p.category_id] = (c[p.category_id] || 0) + 1;
    }
    setCounts(c);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    setError('');
    const { error: dbError } = await supabase
      .from('categories')
      .insert({ name, slug: slugify(name) });
    setBusy(false);
    if (dbError) {
      setError('No se pudo crear. ¿Quizás ya existe una categoría igual?');
      return;
    }
    setNewName('');
    fetchData();
  };

  const handleRename = async (id: number) => {
    const name = editName.trim();
    if (!name) return;
    setBusy(true);
    setError('');
    const { error: dbError } = await supabase
      .from('categories')
      .update({ name, slug: slugify(name) })
      .eq('id', id);
    setBusy(false);
    if (dbError) {
      setError('No se pudo guardar el cambio.');
      return;
    }
    setEditingId(null);
    fetchData();
  };

  const handleDelete = async (cat: Category) => {
    const used = counts[cat.id] || 0;
    const msg = used
      ? `"${cat.name}" tiene ${used} producto(s). Si la eliminás, esos productos quedarán sin categoría. ¿Continuar?`
      : `¿Eliminar la categoría "${cat.name}"?`;
    if (!confirm(msg)) return;
    const { error: dbError } = await supabase.from('categories').delete().eq('id', cat.id);
    if (dbError) {
      alert('No se pudo eliminar la categoría.');
      return;
    }
    fetchData();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 font-logo">Categorías</h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      {/* Alta */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría (ej. Snacks y Premios)"
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={busy || !newName.trim()}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Todavía no hay categorías. Creá la primera arriba.</p>
        </div>
      ) : (
        <ul className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-3 px-4 py-3">
              {editingId === cat.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(cat.id)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => handleRename(cat.id)}
                    disabled={busy}
                    className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg"
                    aria-label="Guardar"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
                    aria-label="Cancelar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{cat.name}</p>
                    <p className="text-xs text-gray-400">
                      {counts[cat.id] ? `${counts[cat.id]} producto(s)` : 'Sin productos'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditName(cat.name);
                    }}
                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    aria-label="Renombrar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-4">
        <Check className="w-3.5 h-3.5" />
        Las categorías aparecen en el catálogo y en el filtro de productos.
      </p>
    </div>
  );
}
