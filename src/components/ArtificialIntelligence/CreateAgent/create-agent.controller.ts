import { Body, Controller, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { CreateAgentDto } from './create-agent.dto';
import { CreateAgentService } from './create-agent.service';

@Controller('agent')
export class CreateAgentController {
  constructor(private readonly createAgentService: CreateAgentService) {}

  @Post('create')
  @RequirePermissions('agent.write')
  async execute(
    @Body() dto: CreateAgentDto,
    @Res() res: FastifyReply,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.createAgentService.execute(dto, user);
    return res.status(201).send(result);
  }
}
