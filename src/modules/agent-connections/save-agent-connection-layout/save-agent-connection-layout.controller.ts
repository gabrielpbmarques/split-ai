import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { SaveAgentConnectionLayoutDto } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.dto';
import { SaveAgentConnectionLayoutService } from 'src/modules/agent-connections/save-agent-connection-layout/save-agent-connection-layout.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('agent-connections')
@Controller('agent-connection')
export class SaveAgentConnectionLayoutController {
  constructor(
    private readonly saveAgentConnectionLayoutService: SaveAgentConnectionLayoutService,
  ) {}

  @Post('layout')
  @RequirePermissions('agent-connection.manage')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: SaveAgentConnectionLayoutDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.saveAgentConnectionLayoutService.execute(
      dto,
      user,
    );
    return res.status(200).send(result);
  }
}
