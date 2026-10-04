import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { CreateAgentConnectionDto } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.dto';
import { CreateAgentConnectionService } from 'src/modules/agent-connections/create-agent-connection/create-agent-connection.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('agent-connections')
@Controller('agent-connection')
export class CreateAgentConnectionController {
  constructor(
    private readonly createAgentConnectionService: CreateAgentConnectionService,
  ) {}

  @Post('create')
  @RequirePermissions('agent-connection.manage')
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: CreateAgentConnectionDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<FastifyReply> {
    const result = await this.createAgentConnectionService.execute(dto, user);
    return res.status(201).send(result);
  }
}
