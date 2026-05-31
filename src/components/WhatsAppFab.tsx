'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

const WHATSAPP = '5493492330291';
const DEFAULT_MSG =
  '🐾 ¡Hola Hipermascota! Quería hacer una consulta sobre sus productos.';

export default function WhatsAppFab() {
  const pathname = usePathname();

  // No mostrar en el panel de administración.
  if (pathname.startsWith('/admin')) return null;

  return (
    <a
      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(DEFAULT_MSG)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-full shadow-lg shadow-green-900/20 transition-transform hover:scale-105 active:scale-95"
    >
      <MessageCircle className="w-7 h-7 relative" />
      <span className="absolute inset-0 inline-flex rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />
    </a>
  );
}
