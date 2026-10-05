import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetAgentService } from 'src/modules/agents/get-agent/get-agent.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('agents')
@Controller('agent')
export class GetAgentController {
  constructor(private readonly getAgentService: GetAgentService) {}

  @Get(':id')
  @RequirePermissions('agent.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const data = await this.getAgentService.execute(id);
    return res.status(200).send({ data });
  }
}
