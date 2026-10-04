import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { DeleteAgentConnectionDto } from 'src/modules/agent-connections/delete-agent-connection/delete-agent-connection.dto';
import { DeleteAgentConnectionService } from 'src/modules/agent-connections/delete-agent-connection/delete-agent-connection.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('agent-connection')
export class DeleteAgentConnectionController {
  constructor(
    private readonly deleteAgentConnectionService: DeleteAgentConnectionService,
  ) {}

  @Post('delete')
  @RequirePermissions('agent-connection.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: DeleteAgentConnectionDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.deleteAgentConnectionService.execute(
      dto.id,
      user,
    );
    return res.status(200).send(result);
  }
}
