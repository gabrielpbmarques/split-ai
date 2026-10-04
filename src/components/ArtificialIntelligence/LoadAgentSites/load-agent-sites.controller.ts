import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

import { LoadAgentSitesDto } from './load-agent-sites.dto';
import { LoadAgentSitesService } from './load-agent-sites.service';

@Controller('agent')
export class LoadAgentSitesController {
  constructor(private readonly loadAgentSitesService: LoadAgentSitesService) {}

  @Post('load-sites')
  @RequirePermissions('agent.manage')
  async handle(@Res() res: FastifyReply, @Body() body: LoadAgentSitesDto) {
    await this.loadAgentSitesService.execute(body.sites, body.agentId);
    return res.status(200).send({ message: 'Sites loaded successfully' });
  }
}
