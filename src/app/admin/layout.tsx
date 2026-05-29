import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';

export const metadata = {
  title: 'Admin | Hipermascota Rafaela',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
