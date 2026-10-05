import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { UpdateAgentConnectionDto } from 'src/modules/agent-connections/update-agent-connection/update-agent-connection.dto';
import { UpdateAgentConnectionService } from 'src/modules/agent-connections/update-agent-connection/update-agent-connection.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('agent-connections')
@Controller('agent-connection')
export class UpdateAgentConnectionController {
  constructor(
    private readonly updateAgentConnectionService: UpdateAgentConnectionService,
  ) {}

  @Post('update')
  @RequirePermissions('agent-connection.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: UpdateAgentConnectionDto,
  ): Promise<FastifyReply> {
    const result = await this.updateAgentConnectionService.execute(dto);
    return res.status(200).send(result);
  }
}
