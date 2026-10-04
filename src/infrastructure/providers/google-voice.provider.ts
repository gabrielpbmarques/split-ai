import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Provider } from '@nestjs/common';

export class GoogleVoiceService {
  private readonly textToSpeechClient: TextToSpeechClient;

  constructor() {
    this.textToSpeechClient = new TextToSpeechClient();
  }

  async textToSpeech(text: string): Promise<Uint8Array | null | undefined> {
    const [response] = await this.textToSpeechClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'pt-BR',
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    });

    return response.audioContent as Uint8Array;
  }
}

export const GOOGLE_VOICE_SERVICE = 'GOOGLE_VOICE_SERVICE';

export const GoogleVoiceProvider: Provider[] = [
  {
    provide: GOOGLE_VOICE_SERVICE,
    useFactory: (): GoogleVoiceService => new GoogleVoiceService(),
  },
];
