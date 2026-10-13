import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import {
  BadGatewayException,
  type Provider,
  ServiceUnavailableException,
} from '@nestjs/common';

import { env } from 'src/shared/config/env';

export const TEXT_TO_SPEECH_SERVICE = 'TEXT_TO_SPEECH_SERVICE';

export interface ITextToSpeechService {
  synthesize(text: string): Promise<Uint8Array>;
}

type ConvertRequest = Parameters<
  ElevenLabsClient['textToSpeech']['convert']
>[1];

async function streamToBuffer(
  audio: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const reader = audio.getReader();

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks);
}

class GoogleTextToSpeechService implements ITextToSpeechService {
  private client?: TextToSpeechClient;

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

class ElevenLabsTextToSpeechService implements ITextToSpeechService {
  private readonly client?: ElevenLabsClient;

  constructor() {
    if (env.ELEVENLABS_API_KEY) {
      this.client = new ElevenLabsClient({ apiKey: env.ELEVENLABS_API_KEY });
    }
  }

  async synthesize(text: string): Promise<Uint8Array> {
    if (!this.client) {
      throw new ServiceUnavailableException('ElevenLabs não configurado');
    }

    const audio = await this.client.textToSpeech.convert(
      env.ELEVENLABS_VOICE_ID,
      {
        text,
        modelId: env.ELEVENLABS_MODEL_ID,
        outputFormat: env.ELEVENLABS_OUTPUT_FORMAT,
      } as unknown as ConvertRequest,
    );

    return streamToBuffer(audio);
  }
}

class MockTextToSpeechService implements ITextToSpeechService {
  async synthesize(text: string): Promise<Uint8Array> {
    return Buffer.from(`MOCK-AUDIO:${text}`, 'utf-8');
  }
}

export const TextToSpeechProvider: Provider[] = [
  {
    provide: TEXT_TO_SPEECH_SERVICE,
    useFactory: (): ITextToSpeechService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockTextToSpeechService();
      }
      return env.TTS_PROVIDER === 'elevenlabs'
        ? new ElevenLabsTextToSpeechService()
        : new GoogleTextToSpeechService();
    },
  },
];
