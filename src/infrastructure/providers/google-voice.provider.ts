import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class GoogleVoiceService {
  private readonly textToSpeechClient: TextToSpeechClient;

  constructor(private configService: ConfigService) {
    this.textToSpeechClient = new TextToSpeechClient();
  }

  async textToSpeech(text: string): Promise<Uint8Array | null | undefined> {
    const [response] = await this.textToSpeechClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode:
          this.configService.get<string>('googleVoice.languageCode') || 'pt-BR',
        ssmlGender:
          (this.configService.get(
            'googleVoice.ssmlGender',
          ) as protos.google.cloud.texttospeech.v1.SsmlVoiceGender) || 'FEMALE',
      },
      audioConfig: {
        audioEncoding:
          (this.configService.get(
            'googleVoice.audioEncoding',
          ) as protos.google.cloud.texttospeech.v1.AudioEncoding) || 'MP3',
      },
    });

    return response.audioContent as Uint8Array;
  }
}

export const GOOGLE_VOICE_SERVICE = 'GOOGLE_VOICE_SERVICE';

export const GoogleVoiceProvider: Provider[] = [
  {
    provide: GOOGLE_VOICE_SERVICE,
    useFactory: (configService: ConfigService): GoogleVoiceService => {
      return new GoogleVoiceService(configService);
    },
    inject: [ConfigService],
  },
];
