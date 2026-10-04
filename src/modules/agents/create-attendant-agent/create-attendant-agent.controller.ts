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
import { CreateAttendantAgentDto } from 'src/modules/agents/create-attendant-agent/create-attendant-agent.dto';
import { CreateAttendantAgentService } from 'src/modules/agents/create-attendant-agent/create-attendant-agent.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('agents')
@Controller('agent')
export class CreateAttendantAgentController {
  constructor(
    private readonly createAttendantAgentService: CreateAttendantAgentService,
  ) {}

  @Post('/create/attendant')
  @RequirePermissions('agent.write')
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Res() res: FastifyReply,
    @Body() dto: CreateAttendantAgentDto,
    @AuthUser() user: AuthenticatedUser,
  ) {
    const result = await this.createAttendantAgentService.execute(dto, user);
    return res.status(201).send(result);
  }
}
