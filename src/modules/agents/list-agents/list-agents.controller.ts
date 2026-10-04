import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { ListAgentsDto } from 'src/modules/agents/list-agents/list-agents.dto';
import { ListAgentsService } from 'src/modules/agents/list-agents/list-agents.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('agents')
@Controller('agent')
export class ListAgentsController {
  constructor(private readonly listAgentsService: ListAgentsService) {}

  @Get('list')
  @RequirePermissions('agent.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Query() dto: ListAgentsDto,
    @AuthUser() user: AuthenticatedUser,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const result = await this.listAgentsService.execute(user, dto);
    return res.status(200).send(result);
  }
}
