import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { ListSourcesService } from 'src/modules/sources/list-sources/list-sources.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

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
