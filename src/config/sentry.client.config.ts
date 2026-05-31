import * as Sentry from '@sentry/nextjs';

const isDev = process.env.NODE_ENV === 'development';

export function initClientSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN || isDev) {
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENV || 'production',
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'NetworkError' || error?.type === 'TimeoutError') {
          return null;
        }
      }
      return event;
    },
  });
}
