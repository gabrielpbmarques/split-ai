import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

import { ConvertTextToSpeechDto } from './convert-text-to-speech.dto';
import { ConvertTextToSpeechService } from './convert-text-to-speech.service';

@Controller('artificial-intelligence')
export class ConvertTextToSpeechController {
  constructor(
    private readonly convertTextToSpeechService: ConvertTextToSpeechService,
  ) {}

  @Post('convert-text-to-speech')
  @RequirePermissions('voice.synthesize')
  async convertTextToSpeech(
    @Body(new ValidationPipe()) dto: ConvertTextToSpeechDto,
  ) {
    await this.convertTextToSpeechService.execute(dto.text);
  }
}
