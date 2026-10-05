import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { SaveAgentConnectionLayoutDto } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.dto';
import { SaveAgentConnectionLayoutService } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('agent-connections')
@Controller('agent-connection')
export class SaveAgentConnectionLayoutController {
  constructor(
    private readonly saveAgentConnectionLayoutService: SaveAgentConnectionLayoutService,
  ) {}

  @Post('layout')
  @RequirePermissions('agent-connection.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: SaveAgentConnectionLayoutDto,
  ): Promise<FastifyReply> {
    const result = await this.saveAgentConnectionLayoutService.execute(dto);
    return res.status(200).send(result);
  }
}
