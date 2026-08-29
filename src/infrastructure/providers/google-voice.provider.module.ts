import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  GoogleVoiceProvider,
  GOOGLE_VOICE_SERVICE,
} from './google-voice.provider';

@Module({
  imports: [ConfigModule],
  providers: [...GoogleVoiceProvider],
  exports: [GOOGLE_VOICE_SERVICE],
})
export class GoogleVoiceProviderModule {}
