import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { DeleteAgentConnectionDto } from 'src/modules/agent-connections/delete-agent-connection/delete-agent-connection.dto';
import { DeleteAgentConnectionService } from 'src/modules/agent-connections/delete-agent-connection/delete-agent-connection.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('agent-connections')
@Controller('agent-connection')
export class DeleteAgentConnectionController {
  constructor(
    private readonly deleteAgentConnectionService: DeleteAgentConnectionService,
  ) {}

  @Post('delete')
  @RequirePermissions('agent-connection.manage')
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: DeleteAgentConnectionDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    await this.deleteAgentConnectionService.execute(dto.id, user);
    return res.status(204).send();
  }
}
