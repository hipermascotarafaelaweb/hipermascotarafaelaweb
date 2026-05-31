'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { cn } from '@/utils/cn';
import Logo from './Logo';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Navbar({ onCartOpen }: { onCartOpen: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const count = mounted ? totalItems() : 0;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-all',
        scrolled ? 'shadow-sm border-b border-brand-100' : 'border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="shrink-0 min-w-0" aria-label="Hipermascota Rafaela - Inicio">
            <Logo className="text-lg sm:text-2xl whitespace-nowrap" />
          </Link>

          <div className="flex items-center gap-1 ml-auto">
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:text-brand-700 hover:bg-brand-50/60'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={onCartOpen}
              className="relative p-2.5 text-gray-700 hover:text-brand-700 hover:bg-brand-50 rounded-full transition-colors"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ring-2 ring-white">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 text-gray-700 hover:bg-brand-50 rounded-full"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-brand-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block py-3 px-3 rounded-xl font-semibold transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:text-brand-700 hover:bg-brand-50'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
