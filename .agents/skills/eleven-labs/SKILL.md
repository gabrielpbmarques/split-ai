---
name: eleven-labs
description: 'Use APENAS ao trabalhar na implementação ElevenLabs do provedor TEXT_TO_SPEECH_SERVICE (TTS_PROVIDER=elevenlabs) ou em recursos específicos de voz da ElevenLabs. O padrão do projeto é Google Cloud TTS.'
---

# Integração ElevenLabs (`TEXT_TO_SPEECH_SERVICE`)

Referência para manter ou estender a integração com a ElevenLabs no **Sherlock AI** (`split-ai`). No projeto, a síntese de voz é abstraída pelo provedor `TEXT_TO_SPEECH_SERVICE` (`src/infrastructure/providers/text-to-speech.provider.ts`), onde o Google Cloud TTS (`TTS_PROVIDER=google`) é o padrão e a ElevenLabs (`TTS_PROVIDER=elevenlabs`) é a segunda implementação.

## Arquitetura no `split-ai`

### Provedor (`src/infrastructure/providers/text-to-speech.provider.ts`)

```typescript
export const TEXT_TO_SPEECH_SERVICE = 'TEXT_TO_SPEECH_SERVICE';

export interface ITextToSpeechService {
  synthesize(text: string): Promise<Uint8Array>;
}
```

- **Seleção de implementação (`useFactory`):**
  - `env.INTEGRATION_MODE === 'mock'` → `MockTextToSpeechService` (retorna `Buffer.from('MOCK-AUDIO:' + text)` sem chamadas externas);
  - `env.TTS_PROVIDER === 'elevenlabs'` → `ElevenLabsTextToSpeechService` (usa `@elevenlabs/elevenlabs-js`);
  - `env.TTS_PROVIDER === 'google'` (padrão) → `GoogleTextToSpeechService` (usa `@google-cloud/text-to-speech`).
- **Configuração no `env.ts`:**
  - `TTS_PROVIDER`: `'google' | 'elevenlabs'` (padrão `'google'`)
  - `ELEVENLABS_API_KEY`: chave da API ElevenLabs (se ausente com `TTS_PROVIDER=elevenlabs`, `synthesize()` lança `ServiceUnavailableException('ElevenLabs não configurado')` e `/health/ready` reporta `NOT_CONFIGURED`)
  - `ELEVENLABS_VOICE_ID`: ID da voz (padrão `'JBFqnCBsd6RMkjVDRZzb'`)
  - `ELEVENLABS_MODEL_ID`: modelo de síntese (padrão `'eleven_multilingual_v2'`)
  - `ELEVENLABS_OUTPUT_FORMAT`: formato do áudio (padrão `'mp3_44100_128'`)

### Caso de uso consumidor (`src/modules/voice/convert-text-to-speech/`)

- Rota: `POST /voice/synthesize` (`ConvertTextToSpeechController`, permissão `voice.synthesize`).
- Fluxo: `ConvertTextToSpeechService` injeta `TEXT_TO_SPEECH_SERVICE` para gerar o buffer de áudio (`Uint8Array`) e `GCP_STORAGE_SERVICE` para armazenar o arquivo MP3 no bucket `env.GCS_AUDIO_BUCKET`, retornando a URL pública/assinada.

## Uso do SDK `@elevenlabs/elevenlabs-js`

Na versão utilizada pelo projeto, `client.textToSpeech.convert(voiceId, options)` retorna um `ReadableStream<Uint8Array>`, que é convertido em `Buffer` pela função auxiliar `streamToBuffer`:

```typescript
const audio = await this.client.textToSpeech.convert(env.ELEVENLABS_VOICE_ID, {
  text,
  modelId: env.ELEVENLABS_MODEL_ID,
  outputFormat: env.ELEVENLABS_OUTPUT_FORMAT,
} as unknown as ConvertRequest);

return streamToBuffer(audio);
```

## Documentação oficial da ElevenLabs (consulta sob demanda)

Caso precise consultar endpoints adicionais da ElevenLabs (clonagem de voz, Speech-to-Text, Sound Effects, Pronunciations):

- Índice geral em Markdown: `https://elevenlabs.io/docs/overview/intro.md`
- Modelos e limites: `https://elevenlabs.io/docs/overview/models.md`
- Text-to-Speech API: `https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/streaming.md`
- Qualquer página da documentação oficial da ElevenLabs pode ser lida em Markdown puro acrescentando `.md` ao final da URL.
