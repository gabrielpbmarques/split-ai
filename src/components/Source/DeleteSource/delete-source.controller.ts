import { Controller, Delete, Param, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { DeleteSourceService } from './delete-source.service';

@Controller('source')
@UseGuards(AuthGuard)
export class DeleteSourceController {
  constructor(private readonly deleteSourceService: DeleteSourceService) {}

  @Delete(':id')
  @Roles('admin', 'user')
  async handle(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      await this.deleteSourceService.execute(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(error.status || 500).send({ message: error.message });
    }
  }
}
