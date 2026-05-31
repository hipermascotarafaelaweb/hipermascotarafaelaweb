'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Phone, MapPin, CreditCard, Search } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Customer } from '@/types';
import { formatDate } from '@/utils/format';

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
          <div className="relative mb-5 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, DNI o teléfono…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
