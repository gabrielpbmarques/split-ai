import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetSessionMessagesService } from 'src/modules/sessions/get-session-messages/get-session-messages.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('sessions')
@Controller('conversation')
export class GetSessionMessagesController {
  constructor(
    private readonly getSessionMessagesService: GetSessionMessagesService,
  ) {}

  @Get('sessions/:sessionId/messages')
  @RequirePermissions('session.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Param('sessionId') sessionId: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const messages = await this.getSessionMessagesService.execute(sessionId);
    return res.status(200).send(messages);
  }
}
