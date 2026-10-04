import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { UpdateAgentConnectionDto } from 'src/modules/agent-connections/update-agent-connection/update-agent-connection.dto';
import { UpdateAgentConnectionService } from 'src/modules/agent-connections/update-agent-connection/update-agent-connection.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

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
