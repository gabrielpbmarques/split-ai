import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

import {
  IntegrationState,
  notConfigured,
} from 'src/infrastructure/integration/integration.state';
import { TextToSpeech } from 'src/infrastructure/integration/text-to-speech.port';
import { env } from 'src/shared/config/env';

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

export class ElevenLabsTextToSpeechGateway implements TextToSpeech {
  readonly name = 'elevenlabs';

  private readonly client?: ElevenLabsClient;

  constructor() {
    if (env.ELEVENLABS_API_KEY) {
      this.client = new ElevenLabsClient({ apiKey: env.ELEVENLABS_API_KEY });
    }
  }

  state(): IntegrationState {
    return this.client ? 'READY' : 'NOT_CONFIGURED';
  }

  async synthesize(text: string): Promise<Uint8Array> {
    const client = this.client ?? notConfigured(this.name);

    const audio = await client.textToSpeech.convert(env.ELEVENLABS_VOICE_ID, {
      text,
      modelId: env.ELEVENLABS_MODEL_ID,
      outputFormat: env.ELEVENLABS_OUTPUT_FORMAT,
    } as unknown as ConvertRequest);

    return streamToBuffer(audio);
  }
}
