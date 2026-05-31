'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ClipboardList, Users, LogOut, ExternalLink } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import Logo from '@/components/Logo';
import { cn } from '@/utils/cn';

const navItems = [
  { href: '/admin', label: 'Productos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
];

export default function AdminShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-5 border-b border-gray-100">
          <Logo className="text-xl" icon />
          <p className="text-xs text-gray-400 mt-2 font-medium">Panel de administración</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-brand-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver tienda
          </Link>
          <div className="px-4 py-1.5">
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Header mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo className="text-base" />
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    active ? 'bg-brand-50 text-brand-700' : 'text-gray-400 hover:text-gray-700'
                  )}
                  aria-label={item.label}
                >
                  <item.icon className="w-5 h-5" />
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 lg:ml-64">
        <div className="p-5 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
