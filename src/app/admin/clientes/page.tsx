'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Phone, MapPin, CreditCard, Search, Download } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Customer } from '@/types';
import { formatDate } from '@/utils/format';

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
  const csv = [headers, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCustomers((data as Customer[]) || []);
        setLoading(false);
      });
  }, []);

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
        <span className="text-sm text-gray-400">{customers.length} registrados</span>
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
    </div>
  );
}
