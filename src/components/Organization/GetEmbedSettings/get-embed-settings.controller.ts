import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { GetEmbedSettingsService } from './get-embed-settings.service';

@Controller('organization')
export class GetEmbedSettingsController {
  constructor(private readonly service: GetEmbedSettingsService) {}

  @Get(':id/embed-settings')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async handle(@Param('id') id: string, @Res() res: FastifyReply) {
    try {
      const result = await this.service.execute(id);
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send({
        message: error.message || 'Erro ao buscar configurações do embed',
      });
    }
  }
}
