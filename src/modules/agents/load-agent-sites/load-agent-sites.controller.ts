import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { LoadAgentSitesDto } from 'src/modules/agents/load-agent-sites/load-agent-sites.dto';
import { LoadAgentSitesService } from 'src/modules/agents/load-agent-sites/load-agent-sites.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('agents')
@Controller('agent')
export class LoadAgentSitesController {
  constructor(private readonly loadAgentSitesService: LoadAgentSitesService) {}

  @Post('load-sites')
  @RequirePermissions('agent.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Res() res: FastifyReply, @Body() body: LoadAgentSitesDto) {
    await this.loadAgentSitesService.execute(body.sites, body.agentId);
    return res.status(200).send({ message: 'Sites loaded successfully' });
  }
}
