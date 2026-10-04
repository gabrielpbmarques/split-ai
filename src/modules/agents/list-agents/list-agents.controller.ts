import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { ListAgentsService } from 'src/modules/agents/list-agents/list-agents.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('agent')
export class ListAgentsController {
  constructor(private readonly listAgentsService: ListAgentsService) {}

  @Get('list')
  @RequirePermissions('agent.read')
  async handle(@Res() res: FastifyReply, @AuthUser() user: AuthenticatedUser) {
    const agents = await this.listAgentsService.execute(user);
    return res.status(200).send(agents);
  }
}
