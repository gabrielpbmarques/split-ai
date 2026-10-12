import { Controller, Get, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ListAvailableToolsService } from 'src/modules/agents/list-available-tools/list-available-tools.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('agents')
@Controller('agent')
export class ListAvailableToolsController {
  constructor(
    private readonly listAvailableToolsService: ListAvailableToolsService,
  ) {}

  @Get('tools')
  @RequirePermissions('agent.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(@Res() res: FastifyReply): Promise<FastifyReply> {
    const result = this.listAvailableToolsService.execute();
    return res.status(200).send(result);
  }
}
