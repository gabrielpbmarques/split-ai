import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { ListSourcesDto } from 'src/modules/sources/list-sources/list-sources.dto';
import { ListSourcesService } from 'src/modules/sources/list-sources/list-sources.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('sources')
@Controller('source')
export class ListSourcesController {
  constructor(private readonly listSourcesService: ListSourcesService) {}

  @Get()
  @RequirePermissions('source.read')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Query() dto: ListSourcesDto,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    const result = await this.listSourcesService.execute(dto);
    return res.status(200).send(result);
  }
}
