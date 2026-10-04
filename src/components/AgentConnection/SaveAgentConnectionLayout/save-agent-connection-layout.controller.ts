import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

import { SaveAgentConnectionLayoutDto } from './save-agent-connection-layout.dto';
import { SaveAgentConnectionLayoutService } from './save-agent-connection-layout.service';

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
