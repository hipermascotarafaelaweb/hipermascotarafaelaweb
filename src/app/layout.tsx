import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hipermascota Rafaela | Accesorios para Mascotas',
  description:
    'Tienda online de accesorios para mascotas en Rafaela, Santa Fe. Explorá nuestro catálogo y hacé tu pedido por WhatsApp.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <ClientLayout>{children}</ClientLayout>
        <Footer />
      </body>
    </html>
  );
}
