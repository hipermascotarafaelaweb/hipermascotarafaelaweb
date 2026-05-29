import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Contacto | Hipermascota Rafaela',
};

export default function ContactoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contacto</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Información</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Ubicación</p>
                <p className="text-sm text-gray-600">Rafaela, Santa Fe, Argentina</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Teléfono</p>
                <p className="text-sm text-gray-600">+54 9 3492 330921</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Horarios</p>
                <p className="text-sm text-gray-600">Lunes a Sábado: 9:00 - 19:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <MessageCircle className="w-12 h-12 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            ¿Tenés alguna consulta?
          </h2>
          <p className="text-sm text-gray-600">
            Escribinos por WhatsApp y te respondemos al instante.
          </p>
          <a
            href="https://wa.me/5493492330921"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Abrir WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
