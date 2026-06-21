import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrgRoleGuard } from 'src/auth/org-role.guard';
import { OrgRoles } from 'src/decorators/org-roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types';

import { CreateAgentConnectionDto } from './create-agent-connection.dto';
import { CreateAgentConnectionService } from './create-agent-connection.service';

@Controller('agent-connection')
export class CreateAgentConnectionController {
  constructor(
    private readonly createAgentConnectionService: CreateAgentConnectionService,
  ) {}

  @Post('create')
  @UseGuards(AuthGuard, OrgRoleGuard)
  @OrgRoles('owner', 'admin', 'member')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: CreateAgentConnectionDto,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.createAgentConnectionService.execute(dto, user);
      return res.status(201).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
