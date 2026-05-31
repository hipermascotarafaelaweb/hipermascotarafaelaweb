'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppFab from '@/components/WhatsAppFab';
import MobileCartBar from '@/components/MobileCartBar';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { initClientSentry } from '@/config/sentry.client.config';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    initClientSentry();
  }, []);

  // El panel /admin tiene su propio chrome (sin navbar/carrito públicos).
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {!cartOpen && (
        <>
          <WhatsAppFab />
          <MobileCartBar onOpen={() => setCartOpen(true)} />
        </>
      )}
      <ToastContainer />
      <PWAInstallPrompt />
    </>
  );
}
