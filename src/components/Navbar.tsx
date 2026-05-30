'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import Logo from './Logo';

export default function Navbar({ onCartOpen }: { onCartOpen: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const count = mounted ? totalItems() : 0;

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow ${
        scrolled ? 'shadow-md' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="shrink-0">
            <Logo className="h-10" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            <Link href="/" className="hover:text-green-700 transition-colors">
              Inicio
            </Link>
            <Link href="/productos" className="hover:text-green-700 transition-colors">
              Productos
            </Link>
            <Link href="/contacto" className="hover:text-green-700 transition-colors">
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onCartOpen}
              className="relative p-2 text-gray-700 hover:text-green-700 transition-colors"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-6 h-6" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-700"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1">
          <Link href="/" onClick={() => setMenuOpen(false)} className="block py-3 px-2 text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg font-medium">
            Inicio
          </Link>
          <Link href="/productos" onClick={() => setMenuOpen(false)} className="block py-3 px-2 text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg font-medium">
            Productos
          </Link>
          <Link href="/contacto" onClick={() => setMenuOpen(false)} className="block py-3 px-2 text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg font-medium">
            Contacto
          </Link>
        </nav>
      )}
    </header>
  );
}
