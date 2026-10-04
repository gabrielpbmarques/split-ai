import { ServiceUnavailableException } from '@nestjs/common';

export type IntegrationState = 'READY' | 'NOT_CONFIGURED' | 'MOCK';

export interface IntegrationGateway {
  readonly name: string;
  state(): IntegrationState;
}

export function notConfigured(name: string): never {
  throw new ServiceUnavailableException(
    `Integração ${name} não configurada neste ambiente`,
  );
}
