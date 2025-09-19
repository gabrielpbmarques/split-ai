import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { ListAgentsService } from './list-agents.service';

@Controller('agent')
export class ListAgentsController {
  constructor(private readonly listAgentsService: ListAgentsService) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async handle(@Res() res: FastifyReply) {
    try {
      const agents = await this.listAgentsService.execute();
      return res.status(200).send(agents);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  }
}
