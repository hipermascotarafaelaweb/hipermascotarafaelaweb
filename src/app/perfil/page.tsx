'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Loader2, LogOut, Package, Phone, IdCard } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import OrderList from '@/components/OrderList';
import type { Order } from '@/types';

interface CustomerProfile {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  dni: string | null;
}

export default function PerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('first_name, last_name, phone, dni')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const p = data as CustomerProfile | null;
        setProfile(p);

        if (p?.dni) {
          setLoadingOrders(true);
          fetch('/api/historial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni: p.dni }),
          })
            .then((res) => res.json())
            .then((data) => setOrders((data.orders as Order[]) || []))
            .catch(() => {})
            .finally(() => setLoadingOrders(false));
        }
      });
  }, [user]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 font-logo">Mi Perfil</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-10">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-brand-600" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-gray-900 text-lg truncate">
              {profile?.first_name || profile?.last_name
                ? `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
                : 'Mi cuenta'}
            </p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {profile?.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3.5 py-2.5">
              <Phone className="w-4 h-4 text-brand-600 shrink-0" />
              {profile.phone}
            </div>
          )}
          {profile?.dni && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3.5 py-2.5">
              <IdCard className="w-4 h-4 text-brand-600 shrink-0" />
              DNI {profile.dni}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <h2 className="text-xl font-extrabold text-gray-900 mb-4 font-logo">Mis pedidos</h2>

      {loadingOrders ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <OrderList orders={orders} />
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-10 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Todavía no tenés pedidos.</p>
        </div>
      )}
    </div>
  );
}
