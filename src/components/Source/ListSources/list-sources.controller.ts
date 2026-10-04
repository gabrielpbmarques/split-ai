import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

import { ListSourcesService } from './list-sources.service';

@Controller('source')
export class ListSourcesController {
  constructor(private readonly listSourcesService: ListSourcesService) {}

  @Get()
  @RequirePermissions('source.read')
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
