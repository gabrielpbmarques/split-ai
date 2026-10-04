import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';

import { ConvertTextToSpeechDto } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.dto';
import { ConvertTextToSpeechService } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

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
