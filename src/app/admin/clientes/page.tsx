'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Phone, MapPin, CreditCard, Search, Download, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Customer } from '@/types';
import { formatDate } from '@/utils/format';

interface CustomerForm {
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  address: string;
}

const emptyForm: CustomerForm = {
  first_name: '',
  last_name: '',
  dni: '',
  phone: '',
  address: '',
};

function csvCell(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return `'${value.replace(/"/g, '""')}'`;
  }
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadCSV(customers: Customer[]) {
  const headers = ['DNI', 'Nombre', 'Apellido', 'Teléfono', 'Dirección', 'Registrado'];
  const rows = customers.map((c) => [
    c.dni,
    c.first_name,
    c.last_name,
    c.phone,
    c.address || '',
    formatDate(c.created_at),
  ]);
  const csvContent = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  const bom = '﻿';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    setCustomers((data as Customer[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      first_name: customer.first_name,
      last_name: customer.last_name,
      dni: customer.dni,
      phone: customer.phone,
      address: customer.address || '',
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.dni.trim() || !form.phone.trim()) {
      setError('Nombre, apellido, DNI y teléfono son obligatorios.');
      return;
    }
    setBusy(true);
    setError('');

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      dni: form.dni.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || null,
    };

    const { error: dbError } = editingId
      ? await supabase.from('customers').update(payload).eq('id', editingId)
      : await supabase.from('customers').insert(payload);

    setBusy(false);
    if (dbError) {
      setError('No se pudo guardar el cliente. ¿El DNI ya existe?');
      return;
    }
    setShowForm(false);
    fetchCustomers();
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`¿Eliminar cliente "${customer.first_name} ${customer.last_name}"?`)) return;
    const { error } = await supabase.from('customers').delete().eq('id', customer.id);
    if (error) {
      alert('No se pudo eliminar.');
      return;
    }
    fetchCustomers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.dni.includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 font-logo">Clientes</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{customers.length} registrados</span>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </button>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Todavía no hay clientes registrados.</p>
          <p className="text-gray-300 text-sm mt-1">
            Se guardan automáticamente cuando completan sus datos en el carrito.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, DNI o teléfono…"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              onClick={() => downloadCSV(filtered)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Nombre</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">DNI</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell">Teléfono</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden md:table-cell">Dirección</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden lg:table-cell">Registrado</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500 w-16">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.first_name} {c.last_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{c.dni}</td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.phone}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell truncate">{c.address || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 hidden">
            {filtered.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold uppercase shrink-0">
                    {c.first_name.charAt(0)}{c.last_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {c.first_name} {c.last_name}
                    </p>
                    <p className="text-xs text-gray-400">Alta: {formatDate(c.created_at)}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CreditCard className="w-4 h-4 text-gray-300 shrink-0" /> DNI {c.dni}
                  </li>
                  <li>
                    <a
                      href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-700 hover:underline"
                    >
                      <Phone className="w-4 h-4 shrink-0" /> {c.phone}
                    </a>
                  </li>
                  {c.address && (
                    <li className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" /> {c.address}
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900">
                {editingId ? 'Editar cliente' : 'Nuevo cliente'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Juan"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Perez"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">DNI *</label>
                <input
                  type="text"
                  required
                  value={form.dni}
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
                  placeholder="12345678"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="3492 123456"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Av. Principal 123"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-3 rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                {busy ? 'Guardando…' : 'Guardar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
