import * as Sentry from '@sentry/node';
import { config } from 'src/config';

export function initSentryIo(): typeof Sentry {
  Sentry.init({
    dsn: config.sentryDsn,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
    tracesSampleRate: 1.0,
    environment: config.env,
  });

  return Sentry;
}
