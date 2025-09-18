import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ListAgentsService } from './list-agents.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { FastifyReply } from 'fastify';

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
