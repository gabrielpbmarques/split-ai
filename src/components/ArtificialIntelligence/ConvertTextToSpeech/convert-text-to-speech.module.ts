import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { ConvertTextToSpeechController } from './convert-text-to-speech.controller';
import { ConvertTextToSpeechService } from './convert-text-to-speech.service';

@Module({
  imports: [InfrastructureModule],
  providers: [ConvertTextToSpeechService],
  controllers: [ConvertTextToSpeechController],
  exports: [ConvertTextToSpeechService],
})
export class ConvertTextToSpeechModule {}
