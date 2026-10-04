import { Body, Controller, Param, Patch, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { UpdateAgentDto } from 'src/modules/agents/update-agent/update-agent.dto';
import { UpdateAgentService } from 'src/modules/agents/update-agent/update-agent.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User as AuthUser } from 'src/shared/decorators/user.decorator';

@ApiTags('agents')
@Controller('agent')
export class UpdateAgentController {
  constructor(private readonly updateAgentService: UpdateAgentService) {}

  @Patch(':id')
  @RequirePermissions('agent.write')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Param('id') id: string,
    @Body() dto: UpdateAgentDto,
    @AuthUser() user: AuthenticatedUser,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const data = await this.updateAgentService.execute(id, dto, user);
    return res.status(200).send({ data });
  }
}
