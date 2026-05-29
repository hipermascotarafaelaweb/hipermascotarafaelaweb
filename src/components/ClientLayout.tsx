'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="min-h-screen">{children}</main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
