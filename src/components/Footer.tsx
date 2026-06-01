import { MapPin, Clock, Phone } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';

const WHATSAPP = '5493492330291';

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Logo className="text-2xl" stacked light icon />
            <p className="text-sm text-gray-400 mt-4 leading-relaxed">
              Accesorios para perros y gatos en Rafaela, Santa Fe. Calidad y
              atención personalizada, con envío gratis a domicilio.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Navegación
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Inicio</Link></li>
              <li><Link href="/productos" className="hover:text-brand-400 transition-colors">Productos</Link></li>
              <li><Link href="/historial" className="hover:text-brand-400 transition-colors">Mis pedidos</Link></li>
              <li><Link href="/contacto" className="hover:text-brand-400 transition-colors">Contacto</Link></li>
              <li><Link href="/privacidad" className="hover:text-brand-400 transition-colors">Privacidad</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                Rafaela, Santa Fe
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-brand-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                  3492 330291
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Horarios
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <span>
                  Lunes a Sábado<br />
                  <span className="text-gray-400">9:00 a 19:00 hs</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} Hipermascota Rafaela.</span>
          <span className="tracking-wider text-xs">Accesorios para Mascotas</span>
        </div>
      </div>
    </footer>
  );
}
