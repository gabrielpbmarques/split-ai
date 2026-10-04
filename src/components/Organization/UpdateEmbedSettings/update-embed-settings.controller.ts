import { Body, Controller, Param, Patch, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

import { UpdateEmbedSettingsDto } from './update-embed-settings.dto';
import { UpdateEmbedSettingsService } from './update-embed-settings.service';

@Controller('organization')
export class UpdateEmbedSettingsController {
  constructor(private readonly service: UpdateEmbedSettingsService) {}

  @Patch(':id/embed-settings')
  @RequirePermissions('organization.manage')
  async handle(
    @Param('id') id: string,
    @Body() dto: UpdateEmbedSettingsDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.service.execute(id, dto);
    return res.status(200).send(result);
  }
}
