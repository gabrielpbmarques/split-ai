import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { BadGatewayException } from '@nestjs/common';

import { IntegrationState } from 'src/infrastructure/integration/integration.state';
import { TextToSpeech } from 'src/infrastructure/integration/text-to-speech.port';

export class GoogleTextToSpeechGateway implements TextToSpeech {
  readonly name = 'google-tts';

  private client?: TextToSpeechClient;

  state(): IntegrationState {
    return 'READY';
  }

  async synthesize(text: string): Promise<Uint8Array> {
    this.client ??= new TextToSpeechClient();

    const [response] = await this.client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'pt-BR', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    if (!response.audioContent) {
      throw new BadGatewayException('Serviço de voz não devolveu áudio');
    }

    return typeof response.audioContent === 'string'
      ? Buffer.from(response.audioContent, 'base64')
      : response.audioContent;
  }
}
