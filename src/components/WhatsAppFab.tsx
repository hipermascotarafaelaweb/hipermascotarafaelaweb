'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { whatsappLink } from '@/config/site';
import { cn } from '@/utils/cn';
import { useMounted } from '@/hooks/useMounted';
const DEFAULT_MSG =
  '🐾 ¡Hola Hipermascota! Quería hacer una consulta sobre sus productos.';

export default function WhatsAppFab() {
  const pathname = usePathname();
  const mounted = useMounted();
  const items = useCartStore((s) => s.items);

  // No mostrar en el panel de administración.
  if (pathname.startsWith('/admin')) return null;

  // En mobile, si hay barra de carrito visible, subimos el botón.
  const raised = mounted && items.length > 0;

  return (
    <a
      href={whatsappLink(DEFAULT_MSG)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className={cn(
        'fixed right-5 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-full shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95 sm:bottom-5',
        raised ? 'bottom-24' : 'bottom-5'
      )}
    >
      <MessageCircle className="w-7 h-7 relative" />
      <span className="absolute inset-0 inline-flex rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />
    </a>
  );
}
