import { Body, Controller, Param, Patch, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { UpdateAgentDto } from 'src/modules/agents/update-agent/update-agent.dto';
import { UpdateAgentService } from 'src/modules/agents/update-agent/update-agent.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

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
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const data = await this.updateAgentService.execute(id, dto);
    return res.status(200).send({ data });
  }
}
