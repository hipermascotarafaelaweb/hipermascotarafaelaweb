'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import AdminShell from './AdminShell';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && isLoginPage) {
        // Si hay usuario y estamos en login, ir a dashboard
        router.push('/admin');
      } else if (!data.user && !isLoginPage) {
        // Si no hay usuario y NO estamos en login, ir a login (middleware lo redirecciona)
        // Pero aquí solo seteamos loading en false
        // El middleware ya lo redirecciona
      } else {
        // En todos los otros casos, seteamos el usuario
        setUser(data.user);
      }
      setLoading(false);
    });
  }, [router, isLoginPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    // El middleware ya redireccionó a login, pero como fallback esperamos que cargue
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
