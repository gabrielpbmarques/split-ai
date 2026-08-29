import { Module } from '@nestjs/common';
import { GcpStorageProviderModule } from 'src/infrastructure/providers/gcp-storage.provider.module';
import { GoogleVoiceProviderModule } from 'src/infrastructure/providers/google-voice.provider.module';

import { ConvertTextToSpeechController } from './convert-text-to-speech.controller';
import { ConvertTextToSpeechService } from './convert-text-to-speech.service';

@Module({
  imports: [GcpStorageProviderModule, GoogleVoiceProviderModule],
  providers: [ConvertTextToSpeechService],
  controllers: [ConvertTextToSpeechController],
  exports: [ConvertTextToSpeechService],
})
export class ConvertTextToSpeechModule {}
