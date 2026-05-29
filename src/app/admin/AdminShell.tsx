'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PawPrint, Package, ClipboardList, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function AdminShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2 text-amber-600 font-bold">
                <PawPrint className="w-5 h-5" />
                Admin
              </Link>
              <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
                <Link href="/admin" className="flex items-center gap-1 hover:text-amber-600 transition-colors">
                  <Package className="w-4 h-4" />
                  Productos
                </Link>
                <Link href="/admin/pedidos" className="flex items-center gap-1 hover:text-amber-600 transition-colors">
                  <ClipboardList className="w-4 h-4" />
                  Pedidos
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:inline">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
