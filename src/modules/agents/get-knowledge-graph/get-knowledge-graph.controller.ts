import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetKnowledgeGraphService } from 'src/modules/agents/get-knowledge-graph/get-knowledge-graph.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('agents')
@Controller('agent')
export class GetKnowledgeGraphController {
  constructor(
    private readonly getKnowledgeGraphService: GetKnowledgeGraphService,
  ) {}

  @Get(':id/knowledge-graph')
  @RequirePermissions('agent.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const data = await this.getKnowledgeGraphService.execute(id);
    return res.status(200).send({ data });
  }
}
