import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { ListAgentsService } from './list-agents.service';

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
