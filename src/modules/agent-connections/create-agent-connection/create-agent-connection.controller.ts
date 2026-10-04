import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { CreateAgentConnectionDto } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.dto';
import { CreateAgentConnectionService } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('agent-connection')
export class CreateAgentConnectionController {
  constructor(
    private readonly createAgentConnectionService: CreateAgentConnectionService,
  ) {}

  @Post('create')
  @RequirePermissions('agent-connection.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: CreateAgentConnectionDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.createAgentConnectionService.execute(dto, user);
    return res.status(201).send(result);
  }
}
