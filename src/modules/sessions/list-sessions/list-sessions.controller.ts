import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ListSessionsDto } from 'src/modules/sessions/list-sessions/list-sessions.dto';
import { ListSessionsService } from 'src/modules/sessions/list-sessions/list-sessions.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('sessions')
@Controller('conversation')
export class ListSessionsController {
  constructor(private readonly listSessionsService: ListSessionsService) {}

  @Get('sessions')
  @RequirePermissions('session.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Query() dto: ListSessionsDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const sessions = await this.listSessionsService.execute(dto);
    return res.status(200).send(sessions);
  }
}
