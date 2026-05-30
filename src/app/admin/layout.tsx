import AdminGuard from './AdminGuard';

export const metadata = {
  title: 'Admin | Hipermascota Rafaela',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
