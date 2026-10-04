import { Controller, Delete, Param, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { DeleteSourceService } from 'src/modules/sources/delete-source/delete-source.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('sources')
@Controller('source')
export class DeleteSourceController {
  constructor(private readonly deleteSourceService: DeleteSourceService) {}

  @Delete(':id')
  @RequirePermissions('source.write')
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Permissão insuficiente' })
  async handle(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    await this.deleteSourceService.execute(id);
    return res.status(204).send();
  }
}
