import { Injectable } from '@nestjs/common';

import { env } from 'src/shared/config/env';

export type InfrastructureHealthReport = Readonly<Record<string, string>>;

@Injectable()
export class InfrastructureHealthIndicator {
  check(): InfrastructureHealthReport {
    const isMock = env.INTEGRATION_MODE === 'mock';

    return {
      twilio: isMock
        ? 'MOCK'
        : env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
          ? 'READY'
          : 'NOT_CONFIGURED',
      supabase: isMock
        ? 'MOCK'
        : env.SUPABASE_URL && env.SUPABASE_SECRET_KEY
          ? 'READY'
          : 'NOT_CONFIGURED',
      voyage: isMock
        ? 'MOCK'
        : env.VOYAGEAI_API_KEY
          ? 'READY'
          : 'NOT_CONFIGURED',
      anthropic: isMock
        ? 'MOCK'
        : env.ANTHROPIC_API_KEY && env.AI_MODEL
          ? 'READY'
          : 'NOT_CONFIGURED',
      gcs: isMock ? 'MOCK' : 'READY',
      'google-vision': isMock ? 'MOCK' : 'READY',
      'text-to-speech': isMock
        ? 'MOCK'
        : env.TTS_PROVIDER === 'elevenlabs'
          ? env.ELEVENLABS_API_KEY
            ? 'READY'
            : 'NOT_CONFIGURED'
          : 'READY',
      spider: isMock ? 'MOCK' : env.SPIDER_API_KEY ? 'READY' : 'NOT_CONFIGURED',
    };
  }
}
