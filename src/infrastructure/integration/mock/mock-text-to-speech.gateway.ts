import type { IntegrationState } from 'src/infrastructure/integration/integration.state';
import type { TextToSpeech } from 'src/infrastructure/integration/text-to-speech.port';

export class MockTextToSpeechGateway implements TextToSpeech {
  readonly name = 'google-tts';

  state(): IntegrationState {
    return 'MOCK';
  }

  async synthesize(text: string): Promise<Uint8Array> {
    return Buffer.from(`MOCK-AUDIO:${text}`, 'utf-8');
  }
}
