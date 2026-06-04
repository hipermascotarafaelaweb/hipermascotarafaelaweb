import { MapPin, Phone, Clock, MessageCircle, Truck } from 'lucide-react';
import { SITE, whatsappLink } from '@/config/site';

export const metadata = {
  title: `Contacto | ${SITE.name}`,
  description: `Contactanos por WhatsApp. Envío a todo el país.`,
};

export default function ContactoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 font-logo">
          Contacto
        </h1>
        <p className="text-gray-500">Estamos para ayudarte con lo que tu mascota necesite</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900">Información del local</h2>

          <div className="space-y-5">
            {[
              { icon: MapPin, title: 'Ubicación', value: `${SITE.city}, ${SITE.state}, ${SITE.country}` },
              { icon: Truck, title: 'Envíos', value: 'A todo el país' },
              { icon: Clock, title: 'Horarios', value: 'Lunes a Viernes: 09:00 - 19:00' },
            ].map((row) => (
              <div key={row.title} className="flex items-start gap-4">
                <div className="w-11 h-11 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
                  <row.icon className="w-5 h-5 text-brand-700" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{row.title}</p>
                  <p className="text-sm text-gray-600">{row.value}</p>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-brand-700" />
              </div>
              <div>
                <p className="font-bold text-gray-900">WhatsApp</p>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-700 hover:text-brand-800 font-semibold"
                >
                  {SITE.phoneDisplay}
                </a>
              </div>
            </div>

          </div>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            Atiende: {SITE.ownerName}
          </p>
        </div>

        <div className="bg-gradient-to-br from-brand-600 to-leaf-600 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center text-white shadow-lg shadow-brand-600/20">
          <MessageCircle className="w-14 h-14 mb-5 opacity-90" />
          <h2 className="text-2xl font-extrabold mb-2 font-logo">¿Tenés una consulta?</h2>
          <p className="text-brand-50 mb-6 max-w-xs">
            Escribinos por WhatsApp y te respondemos al instante. ¡Estamos para ayudarte!
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-brand-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Abrir WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
