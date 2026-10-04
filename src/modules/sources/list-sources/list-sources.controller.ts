import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ListSourcesService } from 'src/modules/sources/list-sources/list-sources.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('sources')
@Controller('source')
export class ListSourcesController {
  constructor(private readonly listSourcesService: ListSourcesService) {}

  @Get()
  @RequirePermissions('source.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
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
