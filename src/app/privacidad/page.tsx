import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Aviso de Privacidad',
  description:
    'Cómo Hipermascota Rafaela trata y protege los datos personales que nos compartís para coordinar tu pedido.',
};

const WHATSAPP = '5493492330291';

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-brand-700" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-logo">Aviso de Privacidad</h1>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none text-gray-600 space-y-6">
        <p>
          En <strong>Hipermascota Rafaela</strong> cuidamos tus datos con el mismo cariño
          con el que cuidás a tu mascota. Acá te contamos, en simple, qué información
          guardamos y para qué.
        </p>

        <section>
          <h2 className="text-lg font-extrabold text-gray-900">¿Qué datos pedimos?</h2>
          <p>
            Para procesar un pedido te solicitamos: nombre y apellido, DNI, teléfono y
            dirección de envío. Son los datos mínimos necesarios para coordinar la entrega
            y emitir el comprobante de tu compra.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-gray-900">¿Para qué los usamos?</h2>
          <p>Exclusivamente para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Coordinar y realizar el envío de tu pedido.</li>
            <li>Contactarte por WhatsApp para confirmar disponibilidad y entrega.</li>
            <li>Llevar el registro de tus compras y atenderte mejor la próxima vez.</li>
          </ul>
          <p>
            <strong>Nunca</strong> vendemos, alquilamos ni compartimos tus datos con
            terceros para fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-gray-900">¿Dónde se guardan?</h2>
          <p>
            La información se almacena de forma segura en nuestra base de datos y solo
            accede a ella el personal del negocio para gestionar tus pedidos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-gray-900">Tus derechos</h2>
          <p>
            De acuerdo con la Ley Nacional de Protección de Datos Personales (Ley 25.326),
            podés solicitar en cualquier momento acceder, rectificar o eliminar tus datos.
            Para hacerlo, escribinos por{' '}
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 font-semibold hover:underline"
            >
              WhatsApp
            </a>{' '}
            y lo resolvemos a la brevedad.
          </p>
        </section>

        <p className="text-sm text-gray-400 pt-4 border-t border-gray-100">
          Última actualización: mayo de 2026. Si tenés dudas sobre el uso de tus datos,{' '}
          <Link href="/contacto" className="text-brand-600 hover:underline font-semibold">
            contactanos
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
