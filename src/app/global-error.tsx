'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RefreshCw } from 'lucide-react';
// global-error REEMPLAZA al layout raíz cuando se activa, por lo que debe
// traer sus propios estilos globales y definir <html>/<body>.
import './globals.css';

export default function GlobalError({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const retry =
    unstable_retry ?? reset ?? (() => window.location.reload());

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Algo salió mal</h1>
            <p className="text-gray-600 text-sm mb-6">
              Ocurrió un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            <button
              onClick={() => retry()}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </button>
            <p className="text-xs text-gray-400 mt-6">
              Error ID: {error.digest || 'unknown'}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
