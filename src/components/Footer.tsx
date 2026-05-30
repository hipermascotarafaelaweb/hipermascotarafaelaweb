import { MapPin, Clock, Phone } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';
import InstagramIcon from './InstagramIcon';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo className="h-10 brightness-200" />
            <p className="text-sm text-gray-400 mt-4">
              Tu tienda de confianza para accesorios de mascotas en Rafaela, Santa Fe.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://instagram.com/hipermascotarafaela"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5493492330291"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-green-400 transition-colors">Inicio</Link></li>
              <li><Link href="/productos" className="hover:text-green-400 transition-colors">Productos</Link></li>
              <li><Link href="/contacto" className="hover:text-green-400 transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500 shrink-0" />
                Rafaela, Santa Fe
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500 shrink-0" />
                3492 330291
              </li>
              <li className="flex items-center gap-2">
                <InstagramIcon className="w-4 h-4 text-green-500 shrink-0" />
                @hipermascotarafaela
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Horarios</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500 shrink-0" />
                Lun a Sáb: 9:00 - 19:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} Hipermascota Rafaela. Todos los derechos reservados.</span>
          <span>Accesorios para mascotas</span>
        </div>
      </div>
    </footer>
  );
}
