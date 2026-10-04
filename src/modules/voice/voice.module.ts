import { Module } from '@nestjs/common';

import { ConvertTextToSpeechModule } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.module';

@Module({
  imports: [ConvertTextToSpeechModule],
  exports: [ConvertTextToSpeechModule],
})
export class VoiceModule {}
