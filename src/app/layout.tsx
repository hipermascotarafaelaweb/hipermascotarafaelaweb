import type { Metadata, Viewport } from 'next';
import { Inter, Baloo_2, Itim, Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import AuthProvider from '@/components/AuthProvider';

const SITE_URL = 'https://hipermascotarafaelaweb.vercel.app';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-baloo',
});

const itim = Itim({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-itim',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hipermascota Rafaela | Accesorios para Mascotas',
    template: '%s | Hipermascota Rafaela',
  },
  description:
    'Tienda de accesorios para perros y gatos en Rafaela, Santa Fe. Collares, juguetes, comederos, camas y mucho más. Envío gratis y pedido por WhatsApp.',
  keywords: [
    'accesorios mascotas',
    'Rafaela',
    'petshop',
    'collares',
    'juguetes perros',
    'juguetes gatos',
    'comederos',
    'envío nacional',
  ],
  openGraph: {
    title: 'Hipermascota Rafaela | Accesorios para Mascotas',
    description:
      'Accesorios para perros y gatos en Rafaela. Envío gratis y pedido por WhatsApp.',
    url: SITE_URL,
    siteName: 'Hipermascota Rafaela',
    type: 'website',
    locale: 'es_AR',
  },
};

export const viewport: Viewport = {
  themeColor: '#8dc63f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${baloo.variable} ${itim.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col bg-white font-sans text-gray-800 overflow-x-hidden">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
