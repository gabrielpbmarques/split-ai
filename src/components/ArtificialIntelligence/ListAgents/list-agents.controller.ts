import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { ListAgentsService } from './list-agents.service';

@Controller('agent')
export class ListAgentsController {
  constructor(private readonly listAgentsService: ListAgentsService) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(@Res() res: FastifyReply, @AuthUser() user: User) {
    try {
      const agents = await this.listAgentsService.execute(user);
      return res.status(200).send(agents);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  }
}
