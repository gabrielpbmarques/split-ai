import { Module } from '@nestjs/common';

import { GcpStorageProviderModule } from 'src/infrastructure/gcp-storage/gcp-storage.provider.module';
import { GoogleVoiceProviderModule } from 'src/infrastructure/google-voice/google-voice.provider.module';
import { ConvertTextToSpeechController } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.controller';
import { ConvertTextToSpeechService } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.service';

@Module({
  imports: [GcpStorageProviderModule, GoogleVoiceProviderModule],
  providers: [ConvertTextToSpeechService],
  controllers: [ConvertTextToSpeechController],
  exports: [ConvertTextToSpeechService],
})
export class ConvertTextToSpeechModule {}
