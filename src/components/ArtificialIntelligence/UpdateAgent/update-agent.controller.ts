import { Body, Controller, Get, Param, Patch, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { UpdateAgentDto } from './update-agent.dto';
import { UpdateAgentService } from './update-agent.service';

@Controller('agent')
export class UpdateAgentController {
  constructor(private readonly updateAgentService: UpdateAgentService) {}

  // Platform-wide listing of every agent across organizations — admin only.
  @Get()
  @RequirePermissions('agent.manage')
  async list(@Res() res: FastifyReply): Promise<FastifyReply> {
    const data = await this.updateAgentService.list();
    return res.status(200).send({ data });
  }

  @Get(':id')
  @RequirePermissions('agent.read')
  async getOne(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const data = await this.updateAgentService.getOne(id, user);
    return res.status(200).send({ data });
  }

  @Patch(':id')
  @RequirePermissions('agent.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentDto,
    @Res() res: FastifyReply,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const data = await this.updateAgentService.update(id, dto, user);
    return res.status(200).send({ data });
  }
}
