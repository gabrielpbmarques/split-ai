import { Module } from '@nestjs/common';

import { ConvertTextToSpeechController } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.controller';
import { ConvertTextToSpeechService } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.service';

@Module({
  providers: [ConvertTextToSpeechService],
  controllers: [ConvertTextToSpeechController],
  exports: [ConvertTextToSpeechService],
})
export class ConvertTextToSpeechModule {}
