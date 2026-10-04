import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { ListSourcesService } from './list-sources.service';

@Controller('source')
export class ListSourcesController {
  constructor(private readonly listSourcesService: ListSourcesService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(
    @Query('agent_id') agentId: string,
    @Res() res: FastifyReply,
  ): Promise<any> {
    if (!agentId) {
      return { error: 'agent_id é obrigatório', statusCode: 400 };
    }

    const sources = await this.listSourcesService.execute(agentId);
    return res.status(200).send(sources);
  }
}
