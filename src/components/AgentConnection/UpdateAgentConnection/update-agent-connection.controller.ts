import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { UpdateAgentConnectionDto } from './update-agent-connection.dto';
import { UpdateAgentConnectionService } from './update-agent-connection.service';

@Controller('agent-connection')
export class UpdateAgentConnectionController {
  constructor(
    private readonly updateAgentConnectionService: UpdateAgentConnectionService,
  ) {}

  @Post('update')
  @RequirePermissions('agent-connection.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: UpdateAgentConnectionDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.updateAgentConnectionService.execute(dto, user);
    return res.status(200).send(result);
  }
}
