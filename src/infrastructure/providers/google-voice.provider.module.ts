import { Module } from '@nestjs/common';

import {
  GoogleVoiceProvider,
  GOOGLE_VOICE_SERVICE,
} from './google-voice.provider';

@Module({
  providers: [...GoogleVoiceProvider],
  exports: [GOOGLE_VOICE_SERVICE],
})
export class GoogleVoiceProviderModule {}
