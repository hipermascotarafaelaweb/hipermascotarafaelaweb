import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import InstagramIcon from '@/components/InstagramIcon';

export const metadata = {
  title: 'Contacto | Hipermascota Rafaela',
};

export default function ContactoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Contacto</h1>
        <p className="text-gray-500">Estamos para ayudarte con lo que necesites</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Información del Local</h2>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ubicación</p>
                <p className="text-sm text-gray-600">Rafaela, Santa Fe, Argentina</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-600">3492 330291</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <InstagramIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Instagram</p>
                <a
                  href="https://instagram.com/hipermascotarafaela"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  @hipermascotarafaela
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Horarios</p>
                <p className="text-sm text-gray-600">Lunes a Sábado: 9:00 - 19:00</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Propietario: Mariano Ruffino
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-white shadow-lg shadow-green-600/20">
          <MessageCircle className="w-14 h-14 mb-5 opacity-90" />
          <h2 className="text-2xl font-extrabold mb-2">
            ¿Tenés alguna consulta?
          </h2>
          <p className="text-green-100 mb-6 max-w-xs">
            Escribinos por WhatsApp y te respondemos al instante. ¡Estamos para ayudarte!
          </p>
          <a
            href="https://wa.me/5493492330291"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Abrir WhatsApp
          </a>

          <a
            href="https://instagram.com/hipermascotarafaela"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            <InstagramIcon className="w-5 h-5" />
            Seguinos en Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
