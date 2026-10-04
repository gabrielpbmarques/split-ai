import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { GetSourceService } from 'src/modules/sources/get-source/get-source.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('sources')
@Controller('source')
export class GetSourceController {
  constructor(private readonly getSourceService: GetSourceService) {}

  @Get(':id')
  @RequirePermissions('source.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const source = await this.getSourceService.execute(id);
    return res.status(200).send(source);
  }
}
