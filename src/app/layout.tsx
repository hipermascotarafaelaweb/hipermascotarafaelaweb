import type { Metadata } from 'next';
import { Inter, Baloo_2, Chewy } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-baloo',
});

// Tipografía del logotipo: trazo redondeado y dibujado a mano, como la tarjeta.
const chewy = Chewy({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-chewy',
});

export const metadata: Metadata = {
  title: 'Hipermascota Rafaela | Accesorios para Mascotas',
  description:
    'Tienda de accesorios para mascotas en Rafaela, Santa Fe. Collares, juguetes, comederos, camas y mucho más. Hacé tu pedido por WhatsApp.',
  keywords: [
    'accesorios mascotas',
    'Rafaela',
    'petshop',
    'collares',
    'juguetes perros',
    'juguetes gatos',
    'comederos',
  ],
  openGraph: {
    title: 'Hipermascota Rafaela | Accesorios para Mascotas',
    description:
      'Tienda de accesorios para mascotas en Rafaela. Hacé tu pedido por WhatsApp.',
    type: 'website',
    locale: 'es_AR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-gray-800">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
