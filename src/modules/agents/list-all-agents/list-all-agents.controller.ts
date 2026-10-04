import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ListAllAgentsDto } from 'src/modules/agents/list-all-agents/list-all-agents.dto';
import { ListAllAgentsService } from 'src/modules/agents/list-all-agents/list-all-agents.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('agents')
@Controller('agent')
export class ListAllAgentsController {
  constructor(private readonly listAllAgentsService: ListAllAgentsService) {}

  @Get()
  @RequirePermissions('agent.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Query() dto: ListAllAgentsDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const result = await this.listAllAgentsService.execute(dto);
    return res.status(200).send(result);
  }
}
