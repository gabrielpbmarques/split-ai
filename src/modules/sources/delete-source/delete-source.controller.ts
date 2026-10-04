import { Controller, Delete, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { DeleteSourceService } from 'src/modules/sources/delete-source/delete-source.service';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@Controller('source')
export class DeleteSourceController {
  constructor(private readonly deleteSourceService: DeleteSourceService) {}

  @Delete(':id')
  @RequirePermissions('source.write')
  async handle(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    await this.deleteSourceService.execute(id);
    return res.status(204).send();
  }
}
