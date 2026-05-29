import { PawPrint, MapPin, Clock, Phone } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-bold text-lg mb-4">
              <PawPrint className="w-6 h-6" />
              <span>Hipermascota Rafaela</span>
            </div>
            <p className="text-sm text-gray-400">
              Tu tienda de confianza para accesorios de mascotas en Rafaela, Santa Fe.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-amber-500 transition-colors">Inicio</Link></li>
              <li><Link href="/productos" className="hover:text-amber-500 transition-colors">Productos</Link></li>
              <li><Link href="/contacto" className="hover:text-amber-500 transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                Rafaela, Santa Fe, Argentina
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                +54 9 3492 330921
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                Lun a Sáb: 9:00 - 19:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Hipermascota Rafaela. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
