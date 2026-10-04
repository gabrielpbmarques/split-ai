import { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const TEXT_TO_SPEECH = Symbol('TEXT_TO_SPEECH');

export interface TextToSpeech extends IntegrationGateway {
  synthesize(text: string): Promise<Uint8Array>;
}
