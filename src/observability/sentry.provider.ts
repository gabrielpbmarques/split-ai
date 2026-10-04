import * as Sentry from '@sentry/node';
import { env } from 'src/shared/config/env';

export function initSentryIo(): typeof Sentry {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
    tracesSampleRate: 1.0,
    environment: env.NODE_ENV,
  });

  return Sentry;
}
