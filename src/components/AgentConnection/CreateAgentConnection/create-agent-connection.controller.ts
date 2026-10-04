import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { CreateAgentConnectionDto } from './create-agent-connection.dto';
import { CreateAgentConnectionService } from './create-agent-connection.service';

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
