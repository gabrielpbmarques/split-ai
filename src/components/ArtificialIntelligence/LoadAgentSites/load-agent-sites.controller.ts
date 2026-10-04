import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { LoadAgentSitesDto } from './load-agent-sites.dto';
import { LoadAgentSitesService } from './load-agent-sites.service';

@Controller('agent')
export class LoadAgentSitesController {
  constructor(private readonly loadAgentSitesService: LoadAgentSitesService) {}

  @Post('load-sites')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async handle(@Res() res: FastifyReply, @Body() body: LoadAgentSitesDto) {
    await this.loadAgentSitesService.execute(body.sites, body.agentId);
    return res.status(200).send({ message: 'Sites loaded successfully' });
  }
}
