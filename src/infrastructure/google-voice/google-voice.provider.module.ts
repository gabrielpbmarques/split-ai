import { Module } from '@nestjs/common';

import { GoogleVoiceProvider } from 'src/infrastructure/google-voice/google-voice.provider';
import { GOOGLE_VOICE_SERVICE } from 'src/infrastructure/google-voice/google-voice.tokens';

@Module({
  providers: [...GoogleVoiceProvider],
  exports: [GOOGLE_VOICE_SERVICE],
})
export class GoogleVoiceProviderModule {}
