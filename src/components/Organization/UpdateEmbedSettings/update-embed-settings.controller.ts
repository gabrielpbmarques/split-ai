import { Body, Controller, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

import { UpdateEmbedSettingsDto } from './update-embed-settings.dto';
import { UpdateEmbedSettingsService } from './update-embed-settings.service';

@Controller('organization')
export class UpdateEmbedSettingsController {
  constructor(private readonly service: UpdateEmbedSettingsService) {}

  @Patch(':id/embed-settings')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async handle(
    @Param('id') id: string,
    @Body() dto: UpdateEmbedSettingsDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.service.execute(id, dto);
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send({
        message: error.message || 'Erro ao atualizar configurações do embed',
      });
    }
  }
}
