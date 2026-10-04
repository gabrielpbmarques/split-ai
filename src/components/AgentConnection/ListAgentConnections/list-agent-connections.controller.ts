import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { ListAgentConnectionsDto } from './list-agent-connections.dto';
import { ListAgentConnectionsService } from './list-agent-connections.service';

@Controller('agent-connection')
export class ListAgentConnectionsController {
  constructor(
    private readonly listAgentConnectionsService: ListAgentConnectionsService,
  ) {}

  @Post('list')
  @RequirePermissions('agent-connection.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: ListAgentConnectionsDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.listAgentConnectionsService.execute(
      dto.principalAgentId,
      user,
    );
    return res.status(200).send(result);
  }
}
