import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ConvertTextToSpeechDto } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.dto';
import { ConvertTextToSpeechService } from 'src/modules/voice/convert-text-to-speech/convert-text-to-speech.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('voice')
@Controller('artificial-intelligence')
export class ConvertTextToSpeechController {
  constructor(
    private readonly convertTextToSpeechService: ConvertTextToSpeechService,
  ) {}

  @Post('convert-text-to-speech')
  @RequirePermissions('voice.synthesize')
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Body() dto: ConvertTextToSpeechDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const result = await this.convertTextToSpeechService.execute(dto.text);
    return res.status(201).send(result);
  }
}
