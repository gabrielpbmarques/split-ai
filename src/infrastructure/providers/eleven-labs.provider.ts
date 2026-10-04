import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Provider } from '@nestjs/common';
import { env } from 'src/shared/config/env';

// ElevenLabs voice provider. Follows the twilio/sendgrid "Shape B" convention:
// a raw client token (ELEVEN_LABS_CLIENT) plus a method-bearing wrapper token
// (ELEVEN_LABS_SERVICE) that use-case services @Inject.
//
// `textToSpeech(text)` returns MP3 bytes as a `Uint8Array`, mirroring
// `GoogleVoiceService.textToSpeech` so it is a drop-in for the existing
// ConvertTextToSpeech flow (write .mp3 + upload to GCS). Nothing consumes this
// provider yet — the current voice path is still Google TTS.

export const ELEVEN_LABS_CLIENT = 'ELEVEN_LABS_CLIENT';
export const ELEVEN_LABS_SERVICE = 'ELEVEN_LABS_SERVICE';

// Types derived from the installed SDK so the wrapper follows the client's
// contract without pinning to internal type paths (survives SDK upgrades).
type TextToSpeechRequest = Parameters<
  ElevenLabsClient['textToSpeech']['convert']
>[1];
type TextToSpeechStreamRequest = Parameters<
  ElevenLabsClient['textToSpeech']['stream']
>[1];
type SpeechToTextRequest = Parameters<
  ElevenLabsClient['speechToText']['convert']
>[0];

export type TextToSpeechAudioStream = Awaited<
  ReturnType<ElevenLabsClient['textToSpeech']['stream']>
>;
export type SpeechToTextResult = Awaited<
  ReturnType<ElevenLabsClient['speechToText']['convert']>
>;
export type SpeechToTextFile = SpeechToTextRequest['file'];

export interface TextToSpeechOptions {
  voiceId?: string;
  modelId?: string;
  outputFormat?: string;
  languageCode?: string;
  voiceSettings?: TextToSpeechRequest['voiceSettings'];
}

export interface SpeechToTextOptions {
  modelId?: string;
  languageCode?: string;
  diarize?: boolean;
  tagAudioEvents?: boolean;
  numSpeakers?: number;
}

export interface IElevenLabsService {
  textToSpeech(
    text: string,
    options?: TextToSpeechOptions,
  ): Promise<Uint8Array>;
  textToSpeechStream(
    text: string,
    options?: TextToSpeechOptions,
  ): Promise<TextToSpeechAudioStream>;
  speechToText(
    file: SpeechToTextFile,
    options?: SpeechToTextOptions,
  ): Promise<SpeechToTextResult>;
}

async function streamToBuffer(
  audio: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const chunks: Buffer[] = [];

  if (typeof audio?.getReader === 'function') {
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

  // Fallback for a Node Readable / async iterable, just in case.
  for await (const chunk of audio as unknown as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

class ElevenLabsService implements IElevenLabsService {
  constructor(private readonly client: ElevenLabsClient) {}

  async textToSpeech(
    text: string,
    options: TextToSpeechOptions = {},
  ): Promise<Uint8Array> {
    const audioStream = await this.client.textToSpeech.convert(
      options.voiceId || env.ELEVENLABS_VOICE_ID,
      this.buildTextToSpeechRequest(
        text,
        options,
      ) as unknown as TextToSpeechRequest,
    );

    return streamToBuffer(audioStream);
  }

  async textToSpeechStream(
    text: string,
    options: TextToSpeechOptions = {},
  ): Promise<TextToSpeechAudioStream> {
    return this.client.textToSpeech.stream(
      options.voiceId || env.ELEVENLABS_VOICE_ID,
      this.buildTextToSpeechRequest(
        text,
        options,
      ) as unknown as TextToSpeechStreamRequest,
    );
  }

  async speechToText(
    file: SpeechToTextFile,
    options: SpeechToTextOptions = {},
  ): Promise<SpeechToTextResult> {
    return this.client.speechToText.convert({
      file,
      modelId: options.modelId || env.ELEVENLABS_STT_MODEL_ID,
      ...(options.languageCode ? { languageCode: options.languageCode } : {}),
      ...(options.diarize !== undefined ? { diarize: options.diarize } : {}),
      ...(options.tagAudioEvents !== undefined
        ? { tagAudioEvents: options.tagAudioEvents }
        : {}),
      ...(options.numSpeakers !== undefined
        ? { numSpeakers: options.numSpeakers }
        : {}),
    } as SpeechToTextRequest);
  }

  private buildTextToSpeechRequest(
    text: string,
    options: TextToSpeechOptions,
  ): Record<string, unknown> {
    return {
      text,
      modelId: options.modelId || env.ELEVENLABS_MODEL_ID,
      outputFormat: options.outputFormat || env.ELEVENLABS_OUTPUT_FORMAT,
      ...(options.languageCode ? { languageCode: options.languageCode } : {}),
      ...(options.voiceSettings
        ? { voiceSettings: options.voiceSettings }
        : {}),
    };
  }
}

export const ElevenLabsProvider: Provider[] = [
  {
    provide: ELEVEN_LABS_CLIENT,
    useFactory: (): ElevenLabsClient => {
      if (!env.ELEVENLABS_API_KEY) {
        throw new Error('ElevenLabs API key must be provided');
      }
      return new ElevenLabsClient({ apiKey: env.ELEVENLABS_API_KEY });
    },
  },
  {
    provide: ELEVEN_LABS_SERVICE,
    useFactory: (client: ElevenLabsClient): IElevenLabsService => {
      return new ElevenLabsService(client);
    },
    inject: [ELEVEN_LABS_CLIENT],
  },
];
