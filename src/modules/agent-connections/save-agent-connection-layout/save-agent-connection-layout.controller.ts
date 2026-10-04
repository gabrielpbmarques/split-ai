import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { SaveAgentConnectionLayoutDto } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.dto';
import { SaveAgentConnectionLayoutService } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@Controller('agent-connection')
export class SaveAgentConnectionLayoutController {
  constructor(
    private readonly saveAgentConnectionLayoutService: SaveAgentConnectionLayoutService,
  ) {}

  @Post('layout')
  @RequirePermissions('agent-connection.manage')
  async handle(
    @Res() res: FastifyReply,
    @Body(new ValidationPipe()) dto: SaveAgentConnectionLayoutDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.saveAgentConnectionLayoutService.execute(
      dto,
      user,
    );
    return res.status(200).send(result);
  }
}
