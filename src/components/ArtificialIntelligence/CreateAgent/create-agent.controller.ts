import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrgRoleGuard } from 'src/auth/org-role.guard';
import { OrgRoles } from 'src/decorators/org-roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { CreateAgentDto } from './create-agent.dto';
import { CreateAgentService } from './create-agent.service';

@Controller('agent')
export class CreateAgentController {
  constructor(private readonly createAgentService: CreateAgentService) {}

  @Post('create')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin', 'member')
  async execute(
    @Body() dto: CreateAgentDto,
    @Res() res: FastifyReply,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    const result = await this.createAgentService.execute(dto, user);
    return res.status(201).send(result);
  }
}
