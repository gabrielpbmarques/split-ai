import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrgRoleGuard } from 'src/auth/org-role.guard';
import { OrgRoles } from 'src/decorators/org-roles.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { UpdateAgentDto } from './update-agent.dto';
import { UpdateAgentService } from './update-agent.service';

@Controller('agent')
export class UpdateAgentController {
  constructor(private readonly updateAgentService: UpdateAgentService) {}

  // Platform-wide listing of every agent across organizations — admin only.
  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async list(@Res() res: FastifyReply): Promise<FastifyReply> {
    const data = await this.updateAgentService.list();
    return res.status(200).send({ data });
  }

  @Get(':id')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin', 'member')
  async getOne(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    const data = await this.updateAgentService.getOne(id, user);
    return res.status(200).send({ data });
  }

  @Patch(':id')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin', 'member')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentDto,
    @Res() res: FastifyReply,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    const data = await this.updateAgentService.update(id, dto, user);
    return res.status(200).send({ data });
  }
}
